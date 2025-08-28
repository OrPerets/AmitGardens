import { NextRequest, NextResponse } from 'next/server';
import { PlanParamSchema } from '@/lib/validators';
import { jsonError } from '@/lib/api';
import { readAdminSessionCookie } from '@/lib/cookies';
import { getPlanByYyyymm, toggleLock } from '@/lib/repositories/plans';

export async function POST(req: NextRequest) {
  const session = readAdminSessionCookie(req);
  if (!session) return jsonError('unauthorized', 'Unauthorized', 401);
  const body = await req.json().catch(() => null);
  const parsed = PlanParamSchema.safeParse(body);
  if (!parsed.success) return jsonError('invalid_body', 'Invalid request body', 400);
  const yyyymm = parsed.data.plan.replace('-', '');
  const plan = await getPlanByYyyymm(yyyymm);
  if (!plan) return jsonError('not_found', 'Plan not found', 404);
  await toggleLock(plan._id, false);
  return NextResponse.json({ ok: true });
}
