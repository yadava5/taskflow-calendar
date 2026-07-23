import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock environment variables BEFORE any imports so the singleton constructs a
// functional OAuth client (isConfigured() === true).
process.env.GOOGLE_CLIENT_ID = 'test-client-id';
process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
process.env.GOOGLE_REDIRECT_URI = 'http://localhost:3001/auth/google/callback';

// Mirror the sibling GoogleOAuthService test's mock set so importing the
// service has no real side effects (DB/JWT/refresh-token/google-auth-library).
vi.mock('google-auth-library', () => {
  const mockOAuth2Client = {
    generateAuthUrl: vi.fn(),
    getToken: vi.fn(),
    setCredentials: vi.fn(),
    getAccessToken: vi.fn(),
    verifyIdToken: vi.fn(),
  };
  return {
    OAuth2Client: vi.fn(() => mockOAuth2Client),
    __mockOAuth2Client: mockOAuth2Client,
  };
});

vi.mock('../../config/database.js', () => {
  const query = vi.fn();
  const withTransaction = vi.fn();
  return { query, withTransaction, pool: { query } };
});

vi.mock('../../utils/jwt.js', () => ({
  generateTokenPair: vi.fn(),
}));

vi.mock('../RefreshTokenService.js', () => ({
  refreshTokenService: { storeRefreshToken: vi.fn() },
}));

global.fetch = vi.fn();

import { googleOAuthService } from '../GoogleOAuthService.js';

const mockedFetch = vi.mocked(global.fetch);

const baseInput = {
  summary: 'Team sync',
  description: 'Weekly planning',
  start: '2026-08-01T15:00:00.000Z',
  end: '2026-08-01T15:30:00.000Z',
  timeZone: 'America/New_York',
  attendees: ['a@example.com', 'b@example.com'],
  addMeet: false,
};

function mockGoogleResponse(status: number, body: unknown) {
  mockedFetch.mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as unknown as Response);
}

describe('GoogleOAuthService.insertCalendarEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // The token-loading path (DB + decrypt + refresh) is exercised elsewhere;
    // here we isolate the events.insert request shaping.
    vi.spyOn(googleOAuthService, 'getFreshAccessToken').mockResolvedValue(
      'access-token-xyz'
    );
  });

  it('POSTs events.insert with sendUpdates=all, attendee objects, and the bearer token', async () => {
    mockGoogleResponse(200, {
      id: 'evt-1',
      htmlLink: 'https://calendar.google.com/event?eid=evt-1',
      attendees: [{ email: 'a@example.com' }, { email: 'b@example.com' }],
    });

    const result = await googleOAuthService.insertCalendarEvent(
      'user-1',
      baseInput
    );

    expect(mockedFetch).toHaveBeenCalledTimes(1);
    const [url, init] = mockedFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/calendars/primary/events');
    expect(url).toContain('sendUpdates=all');
    // No Meet requested → no conferenceDataVersion.
    expect(url).not.toContain('conferenceDataVersion');
    expect(init.method).toBe('POST');
    expect((init.headers as Record<string, string>).Authorization).toBe(
      'Bearer access-token-xyz'
    );

    const sent = JSON.parse(init.body as string);
    expect(sent.attendees).toEqual([
      { email: 'a@example.com' },
      { email: 'b@example.com' },
    ]);
    expect(sent.start).toEqual({
      dateTime: baseInput.start,
      timeZone: 'America/New_York',
    });
    expect(sent.conferenceData).toBeUndefined();

    expect(result.htmlLink).toBe('https://calendar.google.com/event?eid=evt-1');
    expect(result.attendees).toEqual(['a@example.com', 'b@example.com']);
  });

  it('requests a Google Meet link with conferenceDataVersion=1 when addMeet is true', async () => {
    mockGoogleResponse(200, {
      id: 'evt-2',
      htmlLink: 'https://calendar.google.com/event?eid=evt-2',
      hangoutLink: 'https://meet.google.com/abc-defg-hij',
      attendees: [],
    });

    const result = await googleOAuthService.insertCalendarEvent('user-1', {
      ...baseInput,
      addMeet: true,
    });

    const [url, init] = mockedFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('conferenceDataVersion=1');

    const sent = JSON.parse(init.body as string);
    expect(sent.conferenceData.createRequest.conferenceSolutionKey.type).toBe(
      'hangoutsMeet'
    );
    expect(typeof sent.conferenceData.createRequest.requestId).toBe('string');
    expect(sent.conferenceData.createRequest.requestId.length).toBeGreaterThan(
      0
    );

    expect(result.hangoutLink).toBe('https://meet.google.com/abc-defg-hij');
  });

  it('derives the Meet URL from conferenceData entryPoints when hangoutLink is absent', async () => {
    mockGoogleResponse(200, {
      id: 'evt-3',
      htmlLink: 'https://calendar.google.com/event?eid=evt-3',
      conferenceData: {
        entryPoints: [
          { entryPointType: 'more', uri: 'https://meet.google.com/settings' },
          { entryPointType: 'video', uri: 'https://meet.google.com/xyz-1234' },
        ],
      },
      attendees: [],
    });

    const result = await googleOAuthService.insertCalendarEvent('user-1', {
      ...baseInput,
      addMeet: true,
    });

    expect(result.hangoutLink).toBe('https://meet.google.com/xyz-1234');
  });

  it('maps a 403 (grant lacks calendar.events) to a reconnect-required error', async () => {
    mockGoogleResponse(403, { error: { message: 'insufficient scope' } });

    await expect(
      googleOAuthService.insertCalendarEvent('user-1', baseInput)
    ).rejects.toThrow('GOOGLE_CALENDAR_REAUTH_REQUIRED');
  });

  it('surfaces other Google failures with a status-tagged error', async () => {
    mockGoogleResponse(500, {});

    await expect(
      googleOAuthService.insertCalendarEvent('user-1', baseInput)
    ).rejects.toThrow('GOOGLE_CALENDAR_INSERT_FAILED_500');
  });
});
