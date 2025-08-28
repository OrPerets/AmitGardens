import { NextRequest, NextResponse } from 'next/server';
import { jsonError } from '@/lib/api';
import { readAdminFromAuthorization } from '@/lib/adminAuth';
import { getPlanByYyyymm } from '@/lib/repositories/plans';
import { getGardenerById } from '@/lib/repositories/gardeners';
import { ObjectId } from 'mongodb';
import { listByPlanAndGardener } from '@/lib/repositories/assignments';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = readAdminFromAuthorization(req);
  if (!session) return jsonError('unauthorized', 'Unauthorized', 401);

  const url = new URL(req.url);
  const plan = url.searchParams.get('plan') || '';
  const g = url.searchParams.get('g') || '';
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(plan)) {
    return jsonError('invalid_query', 'Invalid plan', 400);
  }
  let gardenerId: ObjectId;
  try {
    gardenerId = new ObjectId(g);
  } catch {
    return jsonError('invalid_query', 'Invalid gardener id', 400);
  }
  const yyyymm = plan.replace('-', '');
  const planDoc = await getPlanByYyyymm(yyyymm);
  if (!planDoc) return jsonError('not_found', 'Plan not found', 404);

  const gardener = await getGardenerById(gardenerId);
  if (!gardener) return jsonError('not_found', 'Gardener not found', 404);

  const items = await listByPlanAndGardener(planDoc._id, gardenerId);
  const assignments = items.map((a) => ({
    date: a.work_date.toISOString().slice(0, 10),
    address: a.address,
    notes: a.notes || '',
  }));

  return NextResponse.json({
    plan: { year: planDoc.year, month: planDoc.month },
    gardener: { id: gardener._id.toString(), name: gardener.name },
    assignments,
  });
}


