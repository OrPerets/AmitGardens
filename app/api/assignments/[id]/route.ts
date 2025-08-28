import { NextRequest, NextResponse } from 'next/server';
import { PlanQuerySchema } from '@/lib/validators';
import { jsonError, getIp, verifyLink } from '@/lib/api';
import { checkRateLimit } from '@/lib/rateLimit';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongo';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const query = Object.fromEntries(new URL(req.url).searchParams.entries());
  const parsed = PlanQuerySchema.safeParse(query);
  if (!parsed.success) {
    return jsonError('invalid_query', 'Invalid query parameters', 400);
  }
  const { plan, g, t } = parsed.data;
  const key = `${getIp(req)}:assignment-delete`;
  if (!(await checkRateLimit(key))) {
    return jsonError('rate_limit', 'Too many requests', 429);
  }
  const auth = await verifyLink(plan, g, t);
  if ('status' in auth) {
    return jsonError(auth.code, auth.message, auth.status);
  }
  let id: ObjectId;
  try {
    id = new ObjectId(params.id);
  } catch {
    return jsonError('invalid_id', 'Invalid id', 400);
  }
  const db = await getDb();
  const res = await db
    .collection('assignments')
    .deleteOne({ _id: id, plan_id: auth.plan._id, gardener_id: auth.gardenerId });
  if (res.deletedCount === 0) {
    return jsonError('not_found', 'Assignment not found', 404);
  }
  return NextResponse.json({ ok: true });
}
