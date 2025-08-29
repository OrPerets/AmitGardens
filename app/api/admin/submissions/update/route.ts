import { NextRequest, NextResponse } from 'next/server';
import { AdminUpdateSubmissionSchema } from '@/lib/validators';
import { jsonError } from '@/lib/api';
import { readAdminFromAuthorization } from '@/lib/adminAuth';
import { getPlanByYyyymm } from '@/lib/repositories/plans';
import { updateStatus } from '@/lib/repositories/submissions';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const session = readAdminFromAuthorization(req);
  if (!session) return jsonError('unauthorized', 'Unauthorized', 401);
  const body = await req.json().catch(() => null);
  const parsed = AdminUpdateSubmissionSchema.safeParse(body);
  if (!parsed.success) return jsonError('invalid_body', 'Invalid request body', 400);
  const { plan, gardenerId, status, note } = parsed.data;
  const yyyymm = plan.replace('-', '');
  const planDoc = await getPlanByYyyymm(yyyymm);
  if (!planDoc) return jsonError('not_found', 'Plan not found', 404);
  const gid = new ObjectId(gardenerId);
  await updateStatus(planDoc._id, gid, status, note);
  return NextResponse.json({ ok: true });
}
