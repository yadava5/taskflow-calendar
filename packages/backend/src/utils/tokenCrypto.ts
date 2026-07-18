/**
 * At-rest encryption for third-party secrets we must store (today: the Google
 * OAuth refresh token). AES-256-GCM — authenticated, so a tampered ciphertext
 * fails closed on decrypt rather than yielding garbage.
 *
 * Key resolution (first hit wins):
 *   1. GOOGLE_TOKEN_ENC_KEY — 32 raw bytes, base64-encoded (preferred; rotate
 *      independently of auth).
 *   2. Derived from JWT_SECRET via scrypt so the feature is secure out of the
 *      box without provisioning a second secret. Distinct from the JWT signing
 *      use via a fixed context label.
 *
 * Stored format is self-describing and versioned:  v1:<iv_b64>:<tag_b64>:<ct_b64>
 * `decrypt` returns any value lacking the `v1:` prefix unchanged, so a token
 * written before this shipped (there are none in prod yet) still reads back.
 */
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from 'crypto';

const VERSION = 'v1';
const ALGO = 'aes-256-gcm';
const IV_BYTES = 12; // GCM standard nonce length
const KEY_CONTEXT = 'taskflow.google.token.enc.v1';

let cachedKey: Buffer | null = null;

function resolveKey(): Buffer {
  if (cachedKey) return cachedKey;

  const explicit = process.env.GOOGLE_TOKEN_ENC_KEY;
  if (explicit) {
    const buf = Buffer.from(explicit, 'base64');
    if (buf.length === 32) {
      cachedKey = buf;
      return cachedKey;
    }
    // Wrong length — fall through to derivation rather than fail silently weak.
    console.warn(
      'GOOGLE_TOKEN_ENC_KEY is set but not 32 bytes (base64); deriving from JWT_SECRET instead'
    );
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      'TOKEN_ENC_KEY_UNAVAILABLE: set GOOGLE_TOKEN_ENC_KEY or JWT_SECRET'
    );
  }
  // scrypt is deliberately slow, so cache the 32-byte result for the instance.
  cachedKey = scryptSync(secret, KEY_CONTEXT, 32);
  return cachedKey;
}

/** Encrypt a plaintext secret for storage. Returns `v1:iv:tag:ciphertext`. */
export function encryptSecret(plaintext: string): string {
  const key = resolveKey();
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGO, key, iv);
  const ct = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${VERSION}:${iv.toString('base64')}:${tag.toString('base64')}:${ct.toString('base64')}`;
}

/**
 * Decrypt a value produced by {@link encryptSecret}. Values without the version
 * prefix are returned as-is (legacy plaintext tolerance). Throws on a malformed
 * or tampered ciphertext.
 */
export function decryptSecret(stored: string): string {
  if (!stored.startsWith(`${VERSION}:`)) {
    return stored; // legacy plaintext (none expected in prod)
  }
  const [, ivB64, tagB64, ctB64] = stored.split(':');
  if (!ivB64 || !tagB64 || !ctB64) {
    throw new Error('TOKEN_CIPHERTEXT_MALFORMED');
  }
  const key = resolveKey();
  const decipher = createDecipheriv(ALGO, key, Buffer.from(ivB64, 'base64'));
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
  return Buffer.concat([
    decipher.update(Buffer.from(ctB64, 'base64')),
    decipher.final(),
  ]).toString('utf8');
}
