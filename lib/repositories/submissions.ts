import { ObjectId } from 'mongodb';
import { getDb } from '../mongo';
import type { Submission } from '@/types/db';

export async function getStatus(planId: ObjectId, gardenerId: ObjectId): Promise<Submission | null> {
  const db = await getDb();
  return db.collection<Submission>('submissions').findOne({ plan_id: planId, gardener_id: gardenerId });
}

export async function submit(planId: ObjectId, gardenerId: ObjectId): Promise<void> {
  const db = await getDb();
  await db.collection<Submission>('submissions').updateOne(
    { plan_id: planId, gardener_id: gardenerId },
    {
      $set: {
        plan_id: planId,
        gardener_id: gardenerId,
        submitted_at: new Date(),
        status: 'pending',
      },
      $unset: { note: '', reviewed_at: '' },
    },
    { upsert: true },
  );
}

export async function revert(planId: ObjectId, gardenerId: ObjectId): Promise<void> {
  const db = await getDb();
  await db.collection<Submission>('submissions').deleteOne({ plan_id: planId, gardener_id: gardenerId });
}

export async function listByPlan(planId: ObjectId): Promise<Submission[]> {
  const db = await getDb();
  return db.collection<Submission>('submissions').find({ plan_id: planId }).toArray();
}

export async function updateStatus(
  planId: ObjectId,
  gardenerId: ObjectId,
  status: 'approved' | 'needs_changes',
  note?: string,
): Promise<void> {
  const db = await getDb();
  await db.collection<Submission>('submissions').updateOne(
    { plan_id: planId, gardener_id: gardenerId },
    {
      $set: {
        status,
        note,
        reviewed_at: new Date(),
      },
    },
  );
}
