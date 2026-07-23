/**
 * GET /api/auth/verify — validate the caller's access token and return
 * the associated user. The web client's `authAPI.verifyToken()` and the
 * auth guard call this on load to confirm a persisted session is still
 * good. Response shape matches the client's expectation exactly:
 *   { success, data: { user: { id, email, name, picture? } } }
 *
 * Self-contained (no createApiHandler routing) so it behaves identically
 * under the consolidated dispatcher and the filesystem router.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  verifyToken,
  extractTokenFromHeader,
} from '../../packages/backend/src/utils/jwt.js';
import { authService } from '../../packages/backend/src/services/AuthService.js';

export default async function verify(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  const token = extractTokenFromHeader(req.headers.authorization);
  if (!token) {
    res.status(401).json({ success: false, valid: false });
    return;
  }

  try {
    const payload = await verifyToken(token);
    if (payload.type !== 'access') {
      res.status(401).json({ success: false, valid: false });
      return;
    }
    const user = await authService.getUserById(payload.userId);
    if (!user) {
      res.status(401).json({ success: false, valid: false });
      return;
    }
    res.status(200).json({
      success: true,
      data: { user: { id: user.id, email: user.email, name: user.name } },
    });
  } catch {
    res.status(401).json({ success: false, valid: false });
  }
}
