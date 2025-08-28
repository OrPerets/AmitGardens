import { ObjectId } from 'mongodb';
import { getDb } from '../mongo';
import type { Gardener } from '@/types/db';

export async function listGardeners(): Promise<Gardener[]> {
  const db = await getDb();
  return db.collection<Gardener>('gardeners').find().toArray();
}

export async function getGardenerById(id: ObjectId): Promise<Gardener | null> {
  const db = await getDb();
  return db.collection<Gardener>('gardeners').findOne({ _id: id });
}
