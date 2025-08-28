import { createHash, randomBytes } from 'crypto';

const salt = process.env.CRYPTO_TOKEN_SALT;
if (!salt) {
  throw new Error('CRYPTO_TOKEN_SALT missing');
}

export function hashToken(token: string): string {
  const hash = createHash('sha256');
  hash.update(salt + token);
  return `sha256:${hash.digest('hex')}`;
}

export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString('hex');
}

