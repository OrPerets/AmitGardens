import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';

export async function GET() {
  const db = await getDb();
  const count = await db.collection('push_subscriptions').countDocuments({ isActive: true });
  return NextResponse.json({ count });
}


