import { NextRequest, NextResponse } from 'next/server';
import { SubmitSchema } from '@/lib/validators';
import { jsonError, getIp, verifyLink } from '@/lib/api';
import { checkRateLimit } from '@/lib/rateLimit';
import { revert } from '@/lib/repositories/submissions';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = SubmitSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError('invalid_body', 'Invalid request body', 400);
  }
  const { plan, g, t } = parsed.data;
  const key = `${getIp(req)}:revert`;
  if (!(await checkRateLimit(key))) {
    return jsonError('rate_limit', 'Too many requests', 429);
  }
  const auth = await verifyLink(plan, g, t);
  if ('status' in auth) {
    return jsonError(auth.code, auth.message, auth.status);
  }
  if (auth.plan.locked) {
    return jsonError('locked', 'Plan is locked', 400);
  }
  await revert(auth.plan._id, auth.gardenerId);
  return NextResponse.json({ ok: true });
}
