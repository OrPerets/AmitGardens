import { NextRequest, NextResponse } from 'next/server';
import { AdminSubmissionDetailSchema } from '@/lib/validators';
import { jsonError } from '@/lib/api';
import { readAdminFromAuthorization } from '@/lib/adminAuth';
import { getPlanByYyyymm } from '@/lib/repositories/plans';
import { listByPlanAndGardener } from '@/lib/repositories/assignments';
import { getGardenerById } from '@/lib/repositories/gardeners';
import { getStatus } from '@/lib/repositories/submissions';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = readAdminFromAuthorization(req);
  if (!session) return jsonError('unauthorized', 'Unauthorized', 401);
  const params = Object.fromEntries(new URL(req.url).searchParams.entries());
  const parsed = AdminSubmissionDetailSchema.safeParse(params);
  if (!parsed.success) return jsonError('invalid_query', 'Invalid query', 400);
  const { plan, gardenerId } = parsed.data;
  const yyyymm = plan.replace('-', '');
  const planDoc = await getPlanByYyyymm(yyyymm);
  if (!planDoc) return jsonError('not_found', 'Plan not found', 404);
  const gid = new ObjectId(gardenerId);
  const gardener = await getGardenerById(gid);
  if (!gardener) return jsonError('not_found', 'Gardener not found', 404);
  const assignments = await listByPlanAndGardener(planDoc._id, gid);
  const submission = await getStatus(planDoc._id, gid);
  return NextResponse.json({
    gardener: { id: gardener._id.toString(), name: gardener.name, team: gardener.team || '' },
    status: submission?.status || 'pending',
    note: submission?.note || '',
    assignments: assignments.map((a) => ({
      date: a.work_date.toISOString().slice(0, 10),
      address: a.address,
      notes: a.notes || '',
    })),
  });
}
