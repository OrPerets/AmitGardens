import { NextRequest, NextResponse } from 'next/server';
import { readAdminSessionCookie } from '@/lib/cookies';
import { jsonError } from '@/lib/api';

export async function POST(req: NextRequest) {
  const session = readAdminSessionCookie(req);
  if (!session) return jsonError('unauthorized', 'Unauthorized', 401);
  console.log('Reminder requested by', session.email);
  return NextResponse.json({ ok: true }, { status: 202 });
}
