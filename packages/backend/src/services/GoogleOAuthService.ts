import { OAuth2Client } from 'google-auth-library';
import { query, withTransaction } from '../config/database.js';
import { generateTokenPair, TokenPair } from '../utils/jwt.js';
import { refreshTokenService } from './RefreshTokenService.js';
import { encryptSecret, decryptSecret } from '../utils/tokenCrypto.js';

// Pure SQL queries will be used instead of Prisma

export interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
  verified_email: boolean;
}

export interface GoogleAuthResult {
  user: {
    id: string;
    email: string;
    name: string | null;
    avatarUrl?: string;
    createdAt: Date;
  };
  tokens: TokenPair;
  isNewUser: boolean;
}

class GoogleOAuthService {
  private oauth2Client: OAuth2Client;

  constructor() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri =
      process.env.GOOGLE_REDIRECT_URI ||
      'http://localhost:3001/auth/google/callback';

    if (!clientId || !clientSecret) {
      // Don't throw - just create a non-functional client
      // isConfigured() will return false
      this.oauth2Client = new OAuth2Client('', '', redirectUri);
      return;
    }

    this.oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);
  }

  /**
   * Generate Google OAuth authorization URL
   */
  getAuthUrl(options?: {
    redirectUri?: string;
    scopes?: string[];
    state?: string;
  }): string {
    const scopes = options?.scopes ?? [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ];

    const client = options?.redirectUri
      ? new OAuth2Client(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET,
          options.redirectUri
        )
      : this.oauth2Client;

    return client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
      include_granted_scopes: true,
      state: options?.state,
    });
  }

  /**
   * Exchange authorization code for tokens and user info
   */
  async handleCallback(
    code: string,
    redirectUri?: string
  ): Promise<GoogleAuthResult> {
    try {
      // The exchange must use the SAME redirect_uri the consent screen
      // was opened with (the SPA sends its own origin-based value).
      const client = redirectUri
        ? new OAuth2Client(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            redirectUri
          )
        : this.oauth2Client;
      const { tokens } = await client.getToken(code);
      client.setCredentials(tokens);

      // Get user info from Google
      const userInfo = await this.getUserInfo(tokens.access_token!);

      // Find or create user in database
      const result = await this.findOrCreateUser(userInfo);

      // Persist the Google refresh token (issued only on first consent) so
      // later Calendar syncs can mint fresh access tokens server-side.
      if (tokens.refresh_token) {
        await this.storeRefreshToken(result.user.id, tokens.refresh_token);
      }

      return result;
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      throw new Error('GOOGLE_OAUTH_FAILED');
    }
  }

  /** Persist a user's Google refresh token (server-side only, never sent to the client). */
  private async storeRefreshToken(
    userId: string,
    refreshToken: string
  ): Promise<void> {
    // Encrypt at rest (AES-256-GCM). A DB dump/leak never yields a usable
    // Google refresh token without the separate encryption key.
    await query(
      `UPDATE users SET "googleRefreshToken" = $1, "updatedAt" = NOW() WHERE id = $2`,
      [encryptSecret(refreshToken), userId]
    );
  }

  /**
   * Finish a "Connect Google Calendar" grant for an ALREADY-authenticated
   * TaskFlow user: exchange the code and store the refresh token on that
   * user. The Google account email does not need to match the TaskFlow
   * account — the grant belongs to whoever is signed in.
   */
  async connectCalendar(
    userId: string,
    code: string,
    redirectUri: string
  ): Promise<void> {
    const client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );
    const { tokens } = await client.getToken(code);
    if (!tokens.refresh_token) {
      // prompt=consent should always yield one; if not, the user must
      // revoke prior access and retry.
      throw new Error('NO_REFRESH_TOKEN');
    }
    await this.storeRefreshToken(userId, tokens.refresh_token);
  }

  /** Mint a fresh Google access token from the stored refresh token. */
  async getFreshAccessToken(userId: string): Promise<string> {
    const row = await query<{ googleRefreshToken: string | null }>(
      `SELECT "googleRefreshToken" FROM users WHERE id = $1 LIMIT 1`,
      [userId]
    );
    const stored = row.rows[0]?.googleRefreshToken;
    if (!stored) {
      throw new Error('GOOGLE_NOT_CONNECTED');
    }
    const refreshToken = decryptSecret(stored);
    const client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    client.setCredentials({ refresh_token: refreshToken });
    const { token } = await client.getAccessToken();
    if (!token) {
      throw new Error('GOOGLE_TOKEN_REFRESH_FAILED');
    }
    return token;
  }

  /**
   * Verify Google ID token and authenticate user
   */
  async verifyIdToken(idToken: string): Promise<GoogleAuthResult> {
    try {
      const ticket = await this.oauth2Client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new Error('INVALID_ID_TOKEN');
      }

      const userInfo: GoogleUserInfo = {
        id: payload.sub,
        email: payload.email!,
        name: payload.name!,
        picture: payload.picture,
        verified_email: payload.email_verified || false,
      };

      // Find or create user in database
      const result = await this.findOrCreateUser(userInfo);

      return result;
    } catch (error) {
      console.error('Google ID token verification error:', error);
      throw new Error('GOOGLE_TOKEN_VERIFICATION_FAILED');
    }
  }

  /**
   * Get user info from Google API
   */
  private async getUserInfo(accessToken: string): Promise<GoogleUserInfo> {
    try {
      const response = await fetch(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch user info from Google');
      }

      const userInfo = await response.json();
      return userInfo as GoogleUserInfo;
    } catch (error) {
      console.error('Error fetching Google user info:', error);
      throw new Error('GOOGLE_USER_INFO_FAILED');
    }
  }

  /**
   * Find existing user or create new user from Google info
   */
  private async findOrCreateUser(
    googleUserInfo: GoogleUserInfo
  ): Promise<GoogleAuthResult> {
    const { id: googleId, email, name, picture } = googleUserInfo;

    // First, try to find user by Google ID
    let userRow = await query<{
      id: string;
      email: string;
      name: string | null;
      googleId: string | null;
      createdAt: Date;
    }>(
      `SELECT id, email, name, "createdAt", "googleId" FROM users WHERE "googleId" = $1 LIMIT 1`,
      [googleId]
    );
    let user:
      | {
          id: string;
          email: string;
          name: string | null;
          googleId: string | null;
          createdAt: Date;
        }
      | undefined = userRow.rows[0];

    let isNewUser = false;

    if (!user) {
      userRow = await query<{
        id: string;
        email: string;
        name: string | null;
        googleId: string | null;
        createdAt: Date;
      }>(
        `SELECT id, email, name, "createdAt", "googleId" FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1`,
        [email.toLowerCase()]
      );
      user = userRow.rows[0];

      if (user) {
        // Link Google account to existing user
        await query(
          `UPDATE users SET "googleId" = $1, "updatedAt" = NOW() WHERE id = $2`,
          [googleId, user.id]
        );

        // Update profile with Google info if not set
        await query(
          `UPDATE user_profiles SET "avatarUrl" = COALESCE($1, "avatarUrl") WHERE "userId" = $2`,
          [picture || null, user.id]
        );
      } else {
        // Create new user
        const created = await withTransaction(async (tx) => {
          const ins = await query<{
            id: string;
            email: string;
            name: string | null;
            googleId: string | null;
            createdAt: Date;
          }>(
            `INSERT INTO users (id, email, name, "googleId", "createdAt", "updatedAt")
             VALUES (gen_random_uuid()::text, $1, $2, $3, NOW(), NOW()) RETURNING id, email, name, "googleId", "createdAt"`,
            [email.toLowerCase(), name || null, googleId],
            tx
          );
          const u = ins.rows[0];
          await query(
            `INSERT INTO user_profiles (id, "userId", "avatarUrl", timezone) VALUES (gen_random_uuid()::text, $1, $2, 'UTC')`,
            [u.id, picture || null],
            tx
          );
          return u;
        });
        user = created;
        isNewUser = true;
      }
    } else {
      // Update existing Google user info if needed
      if (name && name !== user.name) {
        await query(
          `UPDATE users SET name = $1, "updatedAt" = NOW() WHERE id = $2`,
          [name, user.id]
        );
        user.name = name;
      }

      // Update avatar if changed
      if (picture) {
        await query(
          `UPDATE user_profiles SET "avatarUrl" = $1 WHERE "userId" = $2`,
          [picture, user.id]
        );
      }
    }

    // Ensure user is defined at this point
    if (!user) {
      throw new Error('Failed to find or create user');
    }

    // Generate JWT tokens
    const tokens = await generateTokenPair(user.id, user.email);

    // Store refresh token
    refreshTokenService.storeRefreshToken(
      tokens.refreshToken,
      user.id,
      user.email
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: picture || undefined,
        createdAt: user.createdAt,
      },
      tokens,
      isNewUser,
    };
  }

  /**
   * Revoke Google tokens for user
   */
  async revokeTokens(googleId: string): Promise<void> {
    try {
      // In a real implementation, you would store and revoke the Google refresh token
      // For now, this is a placeholder
      console.log(`Revoking Google tokens for user: ${googleId}`);
    } catch (error) {
      console.error('Error revoking Google tokens:', error);
      // Don't throw error as this is not critical
    }
  }

  /**
   * Unlink Google account from user
   */
  async unlinkAccount(userId: string): Promise<void> {
    const result = await query<{
      id: string;
      googleId: string | null;
      password: string | null;
    }>(`SELECT id, "googleId", password FROM users WHERE id = $1 LIMIT 1`, [
      userId,
    ]);
    const user = result.rows[0];

    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    if (!user.googleId) {
      throw new Error('GOOGLE_ACCOUNT_NOT_LINKED');
    }

    // Check if user has password - don't allow unlinking if it's the only auth method
    if (!user.password) {
      throw new Error('CANNOT_UNLINK_ONLY_AUTH_METHOD');
    }

    // Revoke Google tokens
    await this.revokeTokens(user.googleId);

    // Remove Google ID from user
    await query(
      `UPDATE users SET "googleId" = NULL, "updatedAt" = NOW() WHERE id = $1`,
      [userId]
    );
  }

  /**
   * Check if Google OAuth is properly configured
   */
  isConfigured(): boolean {
    return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  }
}

// Singleton instance
export const googleOAuthService = new GoogleOAuthService();
export default GoogleOAuthService;
