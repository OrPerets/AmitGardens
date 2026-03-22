import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongo';
import type { Gardener, Plan } from '@/types/db';

export async function GET() {
  const db = await getDb();

  await db.collection('plans').createIndex({ year: 1, month: 1 }, { unique: true });
  await db.collection('plan_links').createIndex({ plan_id: 1, gardener_id: 1 }, { unique: true });
  await db.collection('plan_links').createIndex({ expires_at: 1 }, {
    expireAfterSeconds: 0,
    partialFilterExpression: { expires_at: { $type: 'date' } },
  });
  await db
    .collection('assignments')
    .createIndex({ plan_id: 1, gardener_id: 1, work_date: 1, address: 1 }, { unique: true });
  await db.collection('submissions').createIndex({ plan_id: 1, gardener_id: 1 }, { unique: true });
  await db.collection('ratelimits').createIndex({ created_at: 1 }, { expireAfterSeconds: 60 * 10 });

  const gardenersCol = db.collection<Gardener>('gardeners');
  if ((await gardenersCol.countDocuments()) === 0) {
    const FIXED_GARDENERS = [
      { name: 'וויהב', email: 'wahab.example@gmail.com', phone: '+972544563855' },
      { name: 'שחר', email: 'shachar.example@gmail.com', phone: '+972544563855' },
      { name: 'אופיר את גיא', email: 'ofir.guy.example@gmail.com', phone: '+972544563855' },
      { name: 'מלחם מחמוד', email: 'mahmoud.example@gmail.com', phone: '+972544563855' },
      { name: 'רזיאל שטרית', email: 'raziel.example@gmail.com', phone: '+972544563855' },
      { name: 'אור פרץ', email: 'orperets11@gmail.com', phone: '+972544563855' },
    ];
    await gardenersCol.insertMany(
      FIXED_GARDENERS.map((gardener) => ({
        _id: new ObjectId(),
        name: gardener.name,
        email: gardener.email,
        phone: gardener.phone,
        created_at: new Date(),
      })),
    );
  }

  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;
  const plansCol = db.collection<Plan>('plans');
  let plan = await plansCol.findOne({ year, month });
  if (!plan) {
    const res = await plansCol.insertOne({
      _id: new ObjectId(),
      year,
      month,
      locked: false,
      created_at: new Date(),
    });
    plan = { _id: res.insertedId, year, month, locked: false, created_at: new Date() };
  }

  return NextResponse.json({ ok: true, planId: plan._id.toString() });
}
