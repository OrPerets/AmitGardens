import { getDb } from './mongo';

export async function checkRateLimit(
  key: string,
  limit = 60,
  windowMs = 10 * 60 * 1000,
): Promise<boolean> {
  const db = await getDb();
  const col = db.collection<{ key: string; created_at: Date }>('ratelimits');
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowMs);
  await col.deleteMany({ key, created_at: { $lt: windowStart } });
  const count = await col.countDocuments({ key, created_at: { $gte: windowStart } });
  if (count >= limit) return false;
  await col.insertOne({ key, created_at: now });
  return true;
}
