import { Db, MongoClient } from 'mongodb';

let clientPromise: Promise<MongoClient> | undefined;
let cachedDbName: string | undefined;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function ensureClient(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB;
  if (!uri) throw new Error('MONGODB_URI missing');
  if (!dbName) throw new Error('MONGODB_DB missing');
  cachedDbName = dbName;

  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      const client = new MongoClient(uri);
      global._mongoClientPromise = client.connect();
    }
    return global._mongoClientPromise as Promise<MongoClient>;
  }

  if (!clientPromise) {
    const client = new MongoClient(uri);
    clientPromise = client.connect();
  }
  return clientPromise;
}

export async function getDb(): Promise<Db> {
  const mongoClient = await ensureClient();
  return mongoClient.db(cachedDbName);
}
