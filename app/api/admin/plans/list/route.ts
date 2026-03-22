import { NextRequest, NextResponse } from 'next/server';
import { jsonError } from '@/lib/api';
import { readAdminFromAuthorization } from '@/lib/adminAuth';
import { listPlans } from '@/lib/repositories/plans';

export async function GET(req: NextRequest) {
  const session = readAdminFromAuthorization(req);
  if (!session) return jsonError('unauthorized', 'Unauthorized', 401);
  const plans = await listPlans();
  return NextResponse.json({ plans });
}


