import { NextRequest, NextResponse } from 'next/server';
import { PlanParamSchema } from '@/lib/validators';
import { jsonError } from '@/lib/api';
import { readAdminSessionCookie } from '@/lib/cookies';
import { getPlanByYyyymm } from '@/lib/repositories/plans';
import { listGardeners } from '@/lib/repositories/gardeners';
import { getDb } from '@/lib/mongo';
import { exportToCsv } from '@/lib/utils/csv';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = readAdminSessionCookie(req);
  if (!session) return jsonError('unauthorized', 'Unauthorized', 401);
  const url = new URL(req.url);
  const params = Object.fromEntries(url.searchParams.entries());
  const parsed = PlanParamSchema.safeParse(params);
  if (!parsed.success) return jsonError('invalid_query', 'Invalid query', 400);
  const { plan } = parsed.data;
  const format = url.searchParams.get('format');
  const yyyymm = plan.replace('-', '');
  const planDoc = await getPlanByYyyymm(yyyymm);
  if (!planDoc) return jsonError('not_found', 'Plan not found', 404);
  const gardeners = await listGardeners();
  const gardenerMap = new Map(gardeners.map((g) => [g._id.toString(), g.name]));
  const db = await getDb();
  const assignments = await db
    .collection('assignments')
    .find({ plan_id: planDoc._id })
    .toArray();
  const submissions = await db
    .collection('submissions')
    .countDocuments({ plan_id: planDoc._id });
  const coverageDays = new Set(
    assignments.map((a) => a.work_date.toISOString().slice(0, 10)),
  ).size;
  const rows = assignments.map((a) => ({
    date: a.work_date.toISOString().slice(0, 10),
    gardener: gardenerMap.get(a.gardener_id.toString()) || '',
    address: a.address,
    notes: a.notes || '',
  }));
  if (format === 'csv') {
    const csv = exportToCsv(rows, [
      { key: 'date', header: 'תאריך' },
      { key: 'gardener', header: 'גנן' },
      { key: 'address', header: 'כתובת' },
      { key: 'notes', header: 'הערות' },
    ]);
    return new NextResponse(csv, {
      headers: { 'Content-Type': 'text/csv; charset=utf-8' },
    });
  }
  return NextResponse.json({
    stats: {
      gardeners: gardeners.length,
      submitted: submissions,
      assignments: assignments.length,
      coverageDays,
    },
    rows,
    locked: planDoc.locked,
  });
}
