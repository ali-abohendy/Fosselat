import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config();

async function check() {
  const uri = 'mongodb+srv://mostafaapoqura1732003_db_user:kqjmQICcKnfFrJLj@cluster0.l217ixe.mongodb.net/fossclat?retryWrites=true&w=majority';
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('fossclat');
    
    console.log('--- Sessions for LAT001 ---');
    const sessions = await db.collection('sessions').find({ student_family_id: 'LAT001' }).toArray();
    for (const s of sessions) {
      console.log(`Date: ${s.date}, Status: ${s.status}, SubID: ${s.subscription_id}, StudentID: ${s.student_id}, Created: ${s.created_at}`);
    }

    console.log('\n--- Subscriptions for LAT001 ---');
    const subs = await db.collection('subscriptions').find({ family_id: 'LAT001' }).toArray();
    for (const sub of subs) {
      console.log(JSON.stringify(sub, null, 2));
    }
  } finally {
    await client.close();
  }
}

check();
