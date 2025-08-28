import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthSchema } from '@/lib/validators';
import { jsonError } from '@/lib/api';
import { createAdminToken } from '@/lib/adminAuth';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = AdminAuthSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError('invalid_body', 'Invalid credentials', 400);
  }
  const { email, password } = parsed.data;
  if (
    email !== process.env.NEXT_ADMIN_EMAIL ||
    password !== process.env.NEXT_ADMIN_PASSWORD
  ) {
    return jsonError('unauthorized', 'Invalid credentials', 401);
  }
  const token = createAdminToken(email);
  return NextResponse.json({ ok: true, token });
}
