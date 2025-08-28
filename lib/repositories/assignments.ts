import { ObjectId } from 'mongodb';
import { getDb } from '../mongo';
import type { Assignment } from '@/types/db';

export async function listByPlanAndGardener(
  planId: ObjectId,
  gardenerId: ObjectId,
): Promise<Assignment[]> {
  const db = await getDb();
  return db
    .collection<Assignment>('assignments')
    .find({ plan_id: planId, gardener_id: gardenerId })
    .sort({ work_date: 1 })
    .toArray();
}

export interface AssignmentRow {
  work_date: Date;
  address: string;
  notes?: string;
}

export async function bulkUpsert(
  planId: ObjectId,
  gardenerId: ObjectId,
  rows: AssignmentRow[],
): Promise<void> {
  const db = await getDb();
  const col = db.collection<Assignment>('assignments');
  const ops = rows.map((row) => ({
    updateOne: {
      filter: {
        plan_id: planId,
        gardener_id: gardenerId,
        work_date: row.work_date,
        address: row.address,
      },
      update: {
        $set: {
          plan_id: planId,
          gardener_id: gardenerId,
          work_date: row.work_date,
          address: row.address,
          notes: row.notes,
          created_at: new Date(),
        },
      },
      upsert: true,
    },
  }));
  if (ops.length) {
    await col.bulkWrite(ops);
  }
}

export async function deleteById(id: ObjectId): Promise<void> {
  const db = await getDb();
  await db.collection<Assignment>('assignments').deleteOne({ _id: id });
}

export async function importFromPrevMonth(
  planId: ObjectId,
  gardenerId: ObjectId,
  prevPlanId: ObjectId,
): Promise<number> {
  const db = await getDb();
  const col = db.collection<Assignment>('assignments');
  const rows = await col.find({ plan_id: prevPlanId, gardener_id: gardenerId }).toArray();
  if (!rows.length) return 0;
  const ops = rows.map((r) => ({
    updateOne: {
      filter: { plan_id: planId, gardener_id: gardenerId, work_date: r.work_date, address: r.address },
      update: {
        $setOnInsert: {
          plan_id: planId,
          gardener_id: gardenerId,
          work_date: r.work_date,
          address: r.address,
          notes: r.notes,
          created_at: new Date(),
        },
      },
      upsert: true,
    },
  }));
  const res = await col.bulkWrite(ops);
  return res.upsertedCount;
}
