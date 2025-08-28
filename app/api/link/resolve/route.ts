import { NextRequest, NextResponse } from 'next/server';
import { PlanQuerySchema } from '@/lib/validators';
import { checkRateLimit } from '@/lib/rateLimit';
import { getIp, jsonError, verifyLink } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const params = Object.fromEntries(new URL(req.url).searchParams.entries());
  const parsed = PlanQuerySchema.safeParse(params);
  if (!parsed.success) {
    return jsonError('invalid_query', 'Invalid query parameters', 400);
  }
  const { plan, g, t } = parsed.data;
  const key = `${getIp(req)}:link-resolve`;
  if (!(await checkRateLimit(key))) {
    return jsonError('rate_limit', 'Too many requests', 429);
  }
  const auth = await verifyLink(plan, g, t);
  if ('status' in auth) {
    return jsonError(auth.code, auth.message, auth.status);
  }
  return NextResponse.json({
    plan: { id: auth.plan._id.toString(), year: auth.plan.year, month: auth.plan.month, locked: auth.plan.locked },
    gardener: { id: auth.gardener._id.toString(), name: auth.gardener.name },
    submission: auth.submission ? { submitted_at: auth.submission.submitted_at } : null,
  });
}
