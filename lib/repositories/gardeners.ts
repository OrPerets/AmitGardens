import { ObjectId } from 'mongodb';
import { getDb } from '../mongo';
import type { Gardener } from '@/types/db';

// Fixed gardeners list as requested
const FIXED_GARDENERS: readonly { name: string; email?: string; phone?: string }[] = [
  { name: 'וויהב', email: 'wahab.example@gmail.com', phone: '+972544563855' },
  { name: 'שחר', email: 'shachar.example@gmail.com', phone: '+972544563855' },
  { name: 'אופיר את גיא', email: 'ofir.guy.example@gmail.com', phone: '+972544563855' },
  { name: 'מלחם מחמוד', email: 'mahmoud.example@gmail.com', phone: '+972544563855' },
  { name: 'רזיאל שטרית', email: 'raziel.example@gmail.com', phone: '+972544563855' },
  { name: 'אור פרץ', email: 'orperets11@gmail.com', phone: '+972544563855' },
];

export async function listGardeners(): Promise<Gardener[]> {
  const db = await getDb();
  const col = db.collection<Gardener>('gardeners');
  
  // Force update all gardeners with latest data (including phone numbers)
  const updateOps = FIXED_GARDENERS.map((gardener) => ({
    updateOne: {
      filter: { name: gardener.name },
      update: {
        $set: {
          email: gardener.email,
          phone: gardener.phone,
        },
        $setOnInsert: {
          _id: new ObjectId(),
          name: gardener.name,
          created_at: new Date(),
        },
      },
      upsert: true,
    },
  }));
  
  if (updateOps.length) {
    await col.bulkWrite(updateOps, { ordered: false });
  }
  
  // Fetch and return in fixed order
  const gardenerNames = FIXED_GARDENERS.map(g => g.name);
  const refreshed = await col
    .find({ name: { $in: gardenerNames } })
    .toArray();
  const byName = new Map(refreshed.map((g) => [g.name, g]));
  return gardenerNames
    .map((n) => byName.get(n))
    .filter((g): g is Gardener => !!g);
}

export async function getGardenerById(id: ObjectId): Promise<Gardener | null> {
  const db = await getDb();
  return db.collection<Gardener>('gardeners').findOne({ _id: id });
}

export async function getOrCreateGardenerByName(name: string): Promise<Gardener> {
  const normalized = (name || '').trim();
  const gardenerData = FIXED_GARDENERS.find(g => g.name === normalized);
  if (!gardenerData) {
    throw new Error('unknown_gardener');
  }
  const db = await getDb();
  const col = db.collection<Gardener>('gardeners');
  const existing = await col.findOne({ name: normalized });
  if (existing) return existing;
  const res = await col.insertOne({
    _id: new ObjectId(),
    name: normalized,
    email: gardenerData.email,
    phone: gardenerData.phone,
    created_at: new Date(),
  } as Gardener);
  return { _id: res.insertedId, name: normalized, email: gardenerData.email, phone: gardenerData.phone, created_at: new Date() } as Gardener;
}
