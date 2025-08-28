import { createHmac, timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME = 'admin_session';
const secret = process.env.SESSION_SECRET;
if (!secret) {
  throw new Error('SESSION_SECRET missing');
}

export interface AdminSession {
  email: string;
}

function sign(payload: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

export function setAdminSessionCookie(
  res: NextResponse,
  session: AdminSession,
): void {
  const payload = JSON.stringify(session);
  const signature = sign(payload);
  const value = Buffer.from(`${payload}.${signature}`).toString('base64');

  res.cookies.set(COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });
}

export function readAdminSessionCookie(
  req: NextRequest,
): AdminSession | null {
  const raw = req.cookies.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  try {
    const decoded = Buffer.from(raw, 'base64').toString('utf8');
    const [payload, signature] = decoded.split('.');
    if (!payload || !signature) return null;
    const expected = sign(payload);
    const sigBuf = Buffer.from(signature, 'hex');
    const expBuf = Buffer.from(expected, 'hex');
    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }
    const data = JSON.parse(payload);
    if (typeof data.email !== 'string') return null;
    return { email: data.email };
  } catch {
    return null;
  }
}

export function clearAdminSessionCookie(res: NextResponse): void {
  res.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
    path: '/',
  });
}

