import { NextRequest, NextResponse } from 'next/server';
import { PlanParamSchema } from '@/lib/validators';
import { jsonError } from '@/lib/api';
import { readAdminSessionCookie } from '@/lib/cookies';
import { listGardeners } from '@/lib/repositories/gardeners';
import { createOrUpdateLinksForPlan } from '@/lib/repositories/planLinks';
import { createPlanIfMissing } from '@/lib/repositories/plans';

export async function POST(req: NextRequest) {
  const session = readAdminSessionCookie(req);
  if (!session) {
    return jsonError('unauthorized', 'Unauthorized', 401);
  }
  const body = await req.json().catch(() => null);
  const parsed = PlanParamSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError('invalid_body', 'Invalid request body', 400);
  }
  const { plan } = parsed.data;
  const year = Number(plan.slice(0, 4));
  const month = Number(plan.slice(5, 7));
  const planDoc = await createPlanIfMissing(year, month);
  const gardeners = await listGardeners();
  const tokens = await createOrUpdateLinksForPlan(
    planDoc._id,
    gardeners.map((g) => g._id),
  );
  return NextResponse.json({ tokens });
}
