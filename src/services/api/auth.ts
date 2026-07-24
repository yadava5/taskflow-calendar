/**
 * Authentication API service
 */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  // The server returns AuthService.loginUser()'s result verbatim: a nested
  // `{ user, tokens }` shape (not the flat token fields). Typing it flat made
  // `login-form`'s correct `res.data.tokens` access a compile error.
  data?: {
    user: {
      id: string;
      email: string;
      name: string;
      picture?: string;
      createdAt: string;
      updatedAt: string;
    };
    tokens: {
      accessToken: string;
      refreshToken: string;
      expiresAt: number;
    };
  };
  message?: string;
}

export interface SignupResponse {
  success: boolean;
  // Matches the /api/auth/register payload (AuthService result): nested
  // `{ user, tokens }`, not flat token fields.
  data?: {
    user: {
      id: string;
      email: string;
      name: string | null;
      picture?: string;
      createdAt: string;
      updatedAt?: string;
    };
    tokens: {
      accessToken: string;
      refreshToken: string;
      expiresAt: number;
    };
  };
  message?: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  data?: {
    accessToken: string;
    expiresAt: number;
  };
  message?: string;
}

export interface GoogleAuthRequest {
  code: string;
  redirectUri: string;
}

export interface GoogleAuthResponse {
  success: boolean;
  data?: {
    user: {
      id: string;
      email: string;
      name: string | null;
      avatarUrl?: string;
      createdAt: string;
    };
    tokens: {
      accessToken: string;
      refreshToken: string;
      expiresAt: number;
    };
    isNewUser: boolean;
  };
  message?: string;
}

class AuthAPI {
  private baseURL = '/api/auth';

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.baseURL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          // Server returns errors as { error: { message } }; fall back
          // through the older flat shape before the generic message.
          message: data.error?.message || data.message || 'Login failed',
        };
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.',
      };
    }
  }

  async signup(userData: SignupRequest): Promise<SignupResponse> {
    try {
      // The backend registration route is /api/auth/register.
      const response = await fetch(`${this.baseURL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Signup failed',
        };
      }

      return data;
    } catch (error) {
      console.error('Signup error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.',
      };
    }
  }

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    try {
      const response = await fetch(`${this.baseURL}/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Token refresh failed',
        };
      }

      return data;
    } catch (error) {
      console.error('Token refresh error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.',
      };
    }
  }

  async logout(
    accessToken: string,
    refreshToken?: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${this.baseURL}/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.error?.message || 'Logout failed',
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      // Return success even on network error since we'll clear local state anyway
      return { success: true };
    }
  }

  /**
   * Permanently delete the signed-in user's account and all of their data.
   * Strictly user-scoped on the server (DELETE /api/account).
   */
  async deleteAccount(
    accessToken: string
  ): Promise<{ success: boolean; message?: string; deleted?: unknown }> {
    try {
      const response = await fetch('/api/account', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      const contentType = response.headers.get('content-type') || '';
      // Offline/localStorage mode (no backend, e.g. the e2e preview): mirror the
      // rest of the service layer's `isJson` fallback — clear the local caches
      // and treat the account as deleted locally.
      if (!contentType.includes('application/json')) {
        try {
          localStorage.removeItem('calendar-app-tasks');
          localStorage.removeItem('calendar-app-events');
          localStorage.removeItem('calendar-app-calendars');
        } catch {
          // ignore storage failures
        }
        return { success: true };
      }
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        return {
          success: false,
          message:
            data.error?.message || data.message || 'Failed to delete account',
        };
      }
      return { success: true, deleted: data.data };
    } catch (error) {
      console.error('Delete account error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  }

  async googleAuth(authData: GoogleAuthRequest): Promise<GoogleAuthResponse> {
    try {
      const response = await fetch(`${this.baseURL}/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(authData),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Google authentication failed',
        };
      }

      return data;
    } catch (error) {
      console.error('Google auth error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.',
      };
    }
  }

  async verifyToken(token: string): Promise<{
    valid: boolean;
    user?: { id: string; email: string; name?: string; picture?: string };
  }> {
    try {
      const response = await fetch(`${this.baseURL}/verify`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { valid: false };
      }

      return {
        valid: true,
        user: data.data?.user,
      };
    } catch (error) {
      console.error('Token verification error:', error);
      return { valid: false };
    }
  }

  // Get Google OAuth URL.
  //
  // Cadence's Google sign-in doubles as the Google Calendar connect: the SAME
  // consent that authenticates the user also grants the calendar.events scope,
  // so a Google-signed-in user is calendar-connected in one step — no separate
  // "Connect Google Calendar" round-trip. The backend persists the Google
  // refresh token during the code exchange (GoogleOAuthService.handleCallback),
  // so the grant is durable server-side. `access_type=offline` + `prompt=consent`
  // guarantee a refresh token on every sign-in; `include_granted_scopes` makes
  // this an incremental grant that composes with any scopes already consented.
  //
  // Users who sign up with email/password (never through Google) instead use the
  // separate connect affordance in Settings; and a Google user who declines the
  // calendar checkbox on the consent screen falls back to that same affordance.
  getGoogleAuthUrl(redirectUri: string): string {
    const params = new URLSearchParams({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
      redirect_uri: redirectUri,
      response_type: 'code',
      scope:
        'openid email profile https://www.googleapis.com/auth/calendar.events',
      access_type: 'offline',
      prompt: 'consent',
      include_granted_scopes: 'true',
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }
}

export const authAPI = new AuthAPI();
