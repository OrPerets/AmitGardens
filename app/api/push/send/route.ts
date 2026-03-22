import { NextRequest, NextResponse } from 'next/server';
import webPush, { PushSubscription } from 'web-push';
import { getActiveSubscriptions, removeSubscription, markSuccess } from '@/lib/subscriptions';

let vapidConfigured = false;

type SendRequestBody = { title?: string; body?: string; clickUrl?: string };

export async function POST(req: NextRequest) {
  if (!vapidConfigured) {
    const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const priv = process.env.VAPID_PRIVATE_KEY;
    if (!pub || !priv) {
      return NextResponse.json(
        { error: 'missing VAPID keys on server' },
        { status: 500 },
      );
    }
    webPush.setVapidDetails('mailto:admin@example.com', pub, priv);
    vapidConfigured = true;
  }
  const adminToken = req.headers.get('x-admin-token');
  if (!adminToken || adminToken !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { title = 'תזכורת חדשה', body = 'זמינה עדכון/משימה חדשה', clickUrl = '/' } =
    ((await req.json().catch(() => ({}))) as SendRequestBody);

  const subs = await getActiveSubscriptions();
  let sent = 0,
    removed = 0;
  await Promise.all(
    subs.map(async (s) => {
      try {
        await webPush.sendNotification(
          {
            endpoint: s.endpoint,
            keys: s.keys,
          } as unknown as PushSubscription,
          JSON.stringify({ title, body, clickUrl }),
        );
        sent++;
        await markSuccess(s.endpoint);
      } catch (e) {
        const err = e as { statusCode?: number };
        const status = err?.statusCode;
        if (status === 404 || status === 410) {
          await removeSubscription(s.endpoint);
          removed++;
        }
      }
    }),
  );

  return NextResponse.json({ ok: true, sent, removed, total: subs.length });
}


