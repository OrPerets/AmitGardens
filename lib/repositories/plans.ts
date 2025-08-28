import { ObjectId } from 'mongodb';
import { getDb } from '../mongo';
import type { Plan } from '@/types/db';

export async function getPlanByYyyymm(yyyymm: string): Promise<Plan | null> {
  const year = Number(yyyymm.slice(0, 4));
  const month = Number(yyyymm.slice(4, 6));
  const db = await getDb();
  return db.collection<Plan>('plans').findOne({ year, month });
}

export async function toggleLock(planId: ObjectId, locked: boolean): Promise<void> {
  const db = await getDb();
  await db.collection<Plan>('plans').updateOne({ _id: planId }, { $set: { locked } });
}

export async function createPlanIfMissing(year: number, month: number): Promise<Plan> {
  const db = await getDb();
  const col = db.collection<Plan>('plans');
  const existing = await col.findOne({ year, month });
  if (existing) return existing;
  const doc: Plan = { _id: new ObjectId(), year, month, locked: false, created_at: new Date() };
  await col.insertOne(doc);
  return doc;
}
