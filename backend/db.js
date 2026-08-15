import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://mostafaapoqura1732003_db_user:kqjmQICcKnfFrJLj@cluster0.l217ixe.mongodb.net/fossclat?retryWrites=true&w=majority';

let client;
let db;
let connectingPromise = null;

const clientOptions = {
  connectTimeoutMS: 10000,
  serverSelectionTimeoutMS: 10000,
};

export async function connectDB() {
  if (db) return db;
  if (connectingPromise) return connectingPromise;

  connectingPromise = (async () => {
    try {
      client = new MongoClient(MONGO_URI, clientOptions);
      await client.connect();
      db = client.db('fossclat');
      console.log(`[MongoDB] Connected successfully to ${db.databaseName}`);
      return db;
    } catch (error) {
      console.error('[MongoDB] Connection error:', error);
      connectingPromise = null;
      throw error;
    }
  })();

  return connectingPromise;
}

export function getDB() {
  if (!db) {
    connectDB().catch((e) => console.error('[MongoDB] Lazy connect error:', e));
    if (!client) {
      client = new MongoClient(MONGO_URI, clientOptions);
      client.connect().catch((e) => console.error('[MongoDB] Quick connect error:', e));
    }
    return client.db('fossclat');
  }
  return db;
}

export { ObjectId };
