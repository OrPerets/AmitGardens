import { ObjectId } from 'mongodb';
import { getDb } from '../mongo';
import type { Gardener } from '@/types/db';

// Fixed gardeners list as requested
const FIXED_GARDENER_NAMES: readonly string[] = [
  'וויהב',
  'שחר',
  'אופיר את גיא',
  'מלחם מחמוד',
  'רזיאל שטרית',
];

export async function listGardeners(): Promise<Gardener[]> {
  const db = await getDb();
  const col = db.collection<Gardener>('gardeners');
  // Ensure fixed gardeners exist (idempotent)
  const ops = (FIXED_GARDENER_NAMES as string[]).map((name) => ({
    updateOne: {
      filter: { name },
      update: {
        $setOnInsert: {
          _id: new ObjectId(),
          name,
          created_at: new Date(),
        },
      },
      upsert: true,
    },
  }));
  if (ops.length) {
    await col.bulkWrite(ops, { ordered: false });
  }
  // Fetch and return in fixed order
  const refreshed = await col
    .find({ name: { $in: FIXED_GARDENER_NAMES as string[] } })
    .toArray();
  const byName = new Map(refreshed.map((g) => [g.name, g]));
  return (FIXED_GARDENER_NAMES as string[])
    .map((n) => byName.get(n))
    .filter((g): g is Gardener => !!g);
}

export async function getGardenerById(id: ObjectId): Promise<Gardener | null> {
  const db = await getDb();
  return db.collection<Gardener>('gardeners').findOne({ _id: id });
}

export async function getOrCreateGardenerByName(name: string): Promise<Gardener> {
  const normalized = (name || '').trim();
  if (!(FIXED_GARDENER_NAMES as string[]).includes(normalized)) {
    throw new Error('unknown_gardener');
  }
  const db = await getDb();
  const col = db.collection<Gardener>('gardeners');
  const existing = await col.findOne({ name: normalized });
  if (existing) return existing;
  const res = await col.insertOne({
    _id: new ObjectId(),
    name: normalized,
    created_at: new Date(),
  } as Gardener);
  return { _id: res.insertedId, name: normalized, created_at: new Date() } as Gardener;
}
