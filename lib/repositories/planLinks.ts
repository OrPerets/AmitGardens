import { ObjectId } from 'mongodb';
import { getDb } from '../mongo';
import type { PlanLink } from '@/types/db';
import crypto from 'crypto';

function hash(token: string): string {
  const salt = process.env.CRYPTO_TOKEN_SALT || '';
  return crypto.createHash('sha256').update(salt + token).digest('hex');
}

function genToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

export async function createOrUpdateLinksForPlan(
  planId: ObjectId,
  gardenerIds: ObjectId[],
): Promise<Record<string, string>> {
  const db = await getDb();
  const col = db.collection<PlanLink>('plan_links');
  const result: Record<string, string> = {};

  for (const gardenerId of gardenerIds) {
    const token = genToken();
    const tokenHash = hash(token);
    await col.updateOne(
      { plan_id: planId, gardener_id: gardenerId },
      {
        $set: {
          plan_id: planId,
          gardener_id: gardenerId,
          token_hash: tokenHash,
          created_at: new Date(),
        },
      },
      { upsert: true },
    );
    result[gardenerId.toString()] = token;
  }

  return result;
}

export async function resolveLink(
  planId: ObjectId,
  gardenerId: ObjectId,
  token: string,
): Promise<PlanLink | null> {
  const db = await getDb();
  const col = db.collection<PlanLink>('plan_links');
  const tokenHash = hash(token);
  return col.findOne({ plan_id: planId, gardener_id: gardenerId, token_hash: tokenHash });
}
