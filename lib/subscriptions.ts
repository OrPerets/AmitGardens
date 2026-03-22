import { getDb } from './mongo';

export type PushSubscriptionDoc = {
  _id?: string;
  endpoint: string;
  keys: { p256dh: string; auth: string };
  userId?: string | null;
  createdAt: Date;
  lastSuccessAt?: Date | null;
  isActive: boolean;
};

export async function saveSubscription(doc: PushSubscriptionDoc) {
  const db = await getDb();
  await db.collection('push_subscriptions').createIndex({ endpoint: 1 }, { unique: true });
  await db.collection('push_subscriptions').updateOne(
    { endpoint: doc.endpoint },
    { $set: { ...doc, createdAt: doc.createdAt ?? new Date(), isActive: true } },
    { upsert: true },
  );
}

export async function removeSubscription(endpoint: string) {
  const db = await getDb();
  await db.collection('push_subscriptions').deleteOne({ endpoint });
}

export async function getActiveSubscriptions(): Promise<PushSubscriptionDoc[]> {
  const db = await getDb();
  return (await db
    .collection('push_subscriptions')
    .find({ isActive: true })
    .toArray()) as unknown as PushSubscriptionDoc[];
}

export async function markSuccess(endpoint: string) {
  const db = await getDb();
  await db
    .collection('push_subscriptions')
    .updateOne({ endpoint }, { $set: { lastSuccessAt: new Date(), isActive: true } });
}


