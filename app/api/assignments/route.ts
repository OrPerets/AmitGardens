import { NextRequest, NextResponse } from 'next/server';
import { PlanQuerySchema, BulkUpsertSchema } from '@/lib/validators';
import { jsonError, getIp, verifyLink } from '@/lib/api';
import { checkRateLimit } from '@/lib/rateLimit';
import { listByPlanAndGardener, bulkUpsert } from '@/lib/repositories/assignments';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const params = Object.fromEntries(new URL(req.url).searchParams.entries());
  const parsed = PlanQuerySchema.safeParse(params);
  if (!parsed.success) {
    return jsonError('invalid_query', 'Invalid query parameters', 400);
  }
  const { plan, g, t } = parsed.data;
  const key = `${getIp(req)}:assignments-get`;
  if (!(await checkRateLimit(key))) {
    return jsonError('rate_limit', 'Too many requests', 429);
  }
  const auth = await verifyLink(plan, g, t);
  if ('status' in auth) {
    return jsonError(auth.code, auth.message, auth.status);
  }
  const rows = await listByPlanAndGardener(auth.plan._id, auth.gardenerId);
  return NextResponse.json({
    assignments: rows.map((r) => ({
      id: r._id.toString(),
      date: r.work_date.toISOString(),
      address: r.address,
      notes: r.notes || null,
    })),
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = BulkUpsertSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError('invalid_body', 'Invalid request body', 400);
  }
  const { plan, g, t, rows } = parsed.data;
  const key = `${getIp(req)}:assignments-post`;
  if (!(await checkRateLimit(key))) {
    return jsonError('rate_limit', 'Too many requests', 429);
  }
  const auth = await verifyLink(plan, g, t);
  if ('status' in auth) {
    return jsonError(auth.code, auth.message, auth.status);
  }
  const norm = rows.map((r) => {
    const d = new Date(r.date);
    d.setHours(0, 0, 0, 0);
    return { work_date: d, address: r.address, notes: r.notes };
  });
  const res = await bulkUpsert(auth.plan._id, auth.gardenerId, norm);
  return NextResponse.json(res);
}
