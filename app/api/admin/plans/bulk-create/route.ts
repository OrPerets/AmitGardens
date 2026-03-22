import { NextRequest, NextResponse } from 'next/server';
import { BulkCreatePlansSchema } from '@/lib/validators';
import { jsonError } from '@/lib/api';
import { readAdminFromAuthorization } from '@/lib/adminAuth';
import { createPlanIfMissing } from '@/lib/repositories/plans';

export async function POST(req: NextRequest) {
  const session = readAdminFromAuthorization(req);
  if (!session) return jsonError('unauthorized', 'Unauthorized', 401);

  const body = await req.json().catch(() => null);
  const parsed = BulkCreatePlansSchema.safeParse(body);
  if (!parsed.success) return jsonError('invalid_body', 'Invalid request body', 400);

  const { plans } = parsed.data;
  const results: Array<{ plan: string; created: boolean }> = [];
  for (const plan of plans) {
    const year = Number(plan.slice(0, 4));
    const month = Number(plan.slice(5, 7));
    const createdDoc = await createPlanIfMissing(year, month);
    results.push({ plan, created: !!createdDoc });
  }

  return NextResponse.json({ ok: true, count: results.length, results });
}


