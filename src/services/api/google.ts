/**
 * Google Calendar API service (frontend).
 *
 * Wraps the backend's /api/google/* endpoints for the "Schedule a Google Meet
 * meeting" flow: check whether the user has connected Google, fetch a consent
 * URL to (re)connect with the calendar.events scope, and create a meeting that
 * Google itself emails as an invite to every attendee.
 */

import { useAuthStore } from '@/stores/authStore';

const apiBase = '/api';

/**
 * Authenticated fetch with refresh-on-401. The Cadence access token is
 * short-lived (~15 min); a stale one makes an actually-connected user look
 * disconnected (isConnected -> false) or blocks initiating the connect. We
 * proactively refresh a near-expired token before spending it and, on a 401,
 * force one refresh + a single retry — the freshest token is read per attempt.
 */
async function authedFetch(
  input: string,
  init?: RequestInit
): Promise<Response> {
  await useAuthStore.getState().refreshTokenIfNeeded();
  const send = () => {
    const token = useAuthStore.getState().jwtTokens?.accessToken ?? '';
    return fetch(input, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init?.headers ?? {}),
      },
    });
  };
  let resp = await send();
  if (resp.status === 401) {
    const refreshed = await useAuthStore.getState().refreshTokenIfNeeded(true);
    if (refreshed) resp = await send();
  }
  return resp;
}

export interface CreateMeetingInput {
  summary: string;
  description?: string;
  /** ISO 8601 start instant. */
  start: string;
  /** ISO 8601 end instant. */
  end: string;
  /** IANA time zone (e.g. America/New_York). */
  timeZone: string;
  attendees: string[];
  addMeet: boolean;
}

export interface CreatedMeeting {
  id: string;
  htmlLink: string;
  hangoutLink?: string;
  attendees: string[];
  invitesSent: number;
}

/**
 * Raised when Google is not connected (or the grant must be refreshed with the
 * calendar.events scope). The UI treats this as "prompt to connect Google",
 * distinct from a generic failure.
 */
export class GoogleNotConnectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GoogleNotConnectedError';
  }
}

const RECONNECT_CODES = new Set([
  'GOOGLE_NOT_CONNECTED',
  'NO_REFRESH_TOKEN',
  'GOOGLE_CALENDAR_REAUTH_REQUIRED',
]);

export const googleCalendarApi = {
  /** Whether the signed-in user has connected Google Calendar. */
  isConnected: async (): Promise<boolean> => {
    const res = await authedFetch(`${apiBase}/google/meeting`, {
      method: 'GET',
    });
    if (!res.ok) return false;
    const body = await res.json().catch(() => null);
    return Boolean(body?.data?.connected);
  },

  /**
   * Google consent URL to (re)connect Calendar with the calendar.events scope.
   * The caller redirects the browser here; the /auth/google/callback page
   * finishes the grant (state="calendar").
   */
  getConnectUrl: async (): Promise<string> => {
    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const res = await authedFetch(
      `${apiBase}/google/calendar?redirectUri=${encodeURIComponent(redirectUri)}`,
      { method: 'GET' }
    );
    const body = await res.json().catch(() => null);
    if (!res.ok || !body?.data?.authUrl) {
      throw new Error(body?.error?.message || 'Could not start Google connect');
    }
    return body.data.authUrl as string;
  },

  /**
   * Create a meeting on the user's primary Google Calendar. Google emails a
   * calendar invite to every attendee (sendUpdates=all) and, when addMeet is
   * set, attaches a Google Meet link.
   */
  createMeeting: async (input: CreateMeetingInput): Promise<CreatedMeeting> => {
    const res = await authedFetch(`${apiBase}/google/meeting`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
    const body = await res.json().catch(() => null);
    if (!res.ok || !body?.success) {
      const code = body?.error?.code as string | undefined;
      const message = body?.error?.message || 'Failed to create the meeting';
      if (code && RECONNECT_CODES.has(code)) {
        throw new GoogleNotConnectedError(message);
      }
      throw new Error(message);
    }
    return body.data as CreatedMeeting;
  },
};
