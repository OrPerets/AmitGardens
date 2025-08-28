import { NextResponse, NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';
import { getPlanByYyyymm } from './repositories/plans';
import { getGardenerById } from './repositories/gardeners';
import { resolveLink as resolveLinkRepo } from './repositories/planLinks';
import { getStatus } from './repositories/submissions';
import type { Plan, Gardener, Submission } from '@/types/db';

export function jsonError(code: string, message: string, status = 400) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export function getIp(req: NextRequest): string {
  return (
    (req.ip as string | undefined) ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  );
}

export interface AuthContext {
  plan: Plan;
  gardener: Gardener;
  submission: Submission | null;
  gardenerId: ObjectId;
}

export async function verifyLink(
  planStr: string,
  g: string,
  t: string,
): Promise<AuthContext | { status: number; code: string; message: string }> {
  const yyyymm = planStr.replace('-', '');
  const plan = await getPlanByYyyymm(yyyymm);
  if (!plan)
    return { status: 404, code: 'not_found', message: 'Plan not found' };
  let gardenerId: ObjectId;
  try {
    gardenerId = new ObjectId(g);
  } catch {
    return { status: 400, code: 'invalid_g', message: 'Invalid gardener' };
  }
  const gardener = await getGardenerById(gardenerId);
  if (!gardener)
    return { status: 404, code: 'not_found', message: 'Gardener not found' };
  const link = await resolveLinkRepo(plan._id, gardenerId, t);
  if (!link) return { status: 401, code: 'invalid_token', message: 'Invalid token' };
  if (link.expires_at && link.expires_at < new Date())
    return { status: 410, code: 'expired', message: 'Link expired' };
  const submission = await getStatus(plan._id, gardenerId);
  return { plan, gardener, submission, gardenerId };
}
