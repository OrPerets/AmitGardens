import { NextRequest, NextResponse } from 'next/server';
import { saveSubscription, removeSubscription } from '@/lib/subscriptions';

export async function POST(req: NextRequest) {
  const sub = await req.json();
  if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) {
    return NextResponse.json({ error: 'invalid subscription' }, { status: 400 });
  }
  await saveSubscription({
    endpoint: sub.endpoint,
    keys: sub.keys,
    userId: null,
    createdAt: new Date(),
    isActive: true,
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { endpoint } = await req.json();
  if (!endpoint) return NextResponse.json({ error: 'missing endpoint' }, { status: 400 });
  await removeSubscription(endpoint);
  return NextResponse.json({ ok: true });
}


