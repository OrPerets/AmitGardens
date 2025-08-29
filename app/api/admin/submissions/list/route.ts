import { NextRequest, NextResponse } from 'next/server';
import { AdminSubmissionQuerySchema } from '@/lib/validators';
import { jsonError } from '@/lib/api';
import { readAdminFromAuthorization } from '@/lib/adminAuth';
import { getPlanByYyyymm } from '@/lib/repositories/plans';
import { listByPlan } from '@/lib/repositories/submissions';
import { listGardeners } from '@/lib/repositories/gardeners';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = readAdminFromAuthorization(req);
  if (!session) return jsonError('unauthorized', 'Unauthorized', 401);
  const params = Object.fromEntries(new URL(req.url).searchParams.entries());
  const parsed = AdminSubmissionQuerySchema.safeParse(params);
  if (!parsed.success) return jsonError('invalid_query', 'Invalid query', 400);
  const { plan } = parsed.data;
  const yyyymm = plan.replace('-', '');
  const planDoc = await getPlanByYyyymm(yyyymm);
  if (!planDoc) return jsonError('not_found', 'Plan not found', 404);
  const submissions = await listByPlan(planDoc._id);
  const gardeners = await listGardeners();
  const gardenerMap = new Map(gardeners.map((g) => [g._id.toString(), g]));
  const result = submissions.map((s) => {
    const g = gardenerMap.get(s.gardener_id.toString());
    return {
      gardenerId: s.gardener_id.toString(),
      gardener: g?.name || '',
      team: g?.team || '',
      status: s.status || 'pending',
      submitted_at: s.submitted_at,
      note: s.note || '',
    };
  });
  return NextResponse.json({ submissions: result });
}
