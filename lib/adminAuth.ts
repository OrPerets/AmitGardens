import { createHmac, timingSafeEqual } from 'crypto';
import type { NextRequest } from 'next/server';

interface AdminClaims {
  email: string;
  iat: number; // issued at (seconds)
  exp: number; // expires at (seconds)
}

function getSecret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error('SESSION_SECRET missing');
  return s;
}

function base64url(input: Buffer | string): string {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buf
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function sign(payload: string): string {
  return createHmac('sha256', getSecret()).update(payload).digest('base64url');
}

export function createAdminToken(email: string, ttlSeconds = 60 * 60 * 24 * 30): string {
  const now = Math.floor(Date.now() / 1000);
  const claims: AdminClaims = { email, iat: now, exp: now + ttlSeconds };
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64url(JSON.stringify(claims));
  const unsigned = `${header}.${body}`;
  const sig = sign(unsigned);
  return `${unsigned}.${sig}`;
}

export function verifyAdminToken(token: string | null | undefined): { email: string } | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [headerB64, bodyB64, sig] = parts;
  const unsigned = `${headerB64}.${bodyB64}`;
  const expected = sign(unsigned);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const json = Buffer.from(bodyB64.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
    const claims = JSON.parse(json) as AdminClaims;
    if (typeof claims.email !== 'string' || typeof claims.exp !== 'number') return null;
    const now = Math.floor(Date.now() / 1000);
    if (now >= claims.exp) return null;
    return { email: claims.email };
  } catch {
    return null;
  }
}

export function readAdminFromAuthorization(req: NextRequest): { email: string } | null {
  const auth = req.headers.get('authorization') || req.headers.get('Authorization');
  if (!auth) return null;
  const match = auth.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;
  return verifyAdminToken(match[1]);
}


