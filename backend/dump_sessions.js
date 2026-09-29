import { MongoClient } from 'mongodb';

const url = 'mongodb+srv://Fosselat:7C125d0c83aA@cluster0.zoxok.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const dbName = 'fosselat';

async function main() {
  const client = new MongoClient(url);
  try {
    await client.connect();
    const db = client.db(dbName);
    
    // Find teacher Shahd
    const teacher = await db.collection('users').findOne({ full_name: /Shahd/i });
    if (!teacher) {
      console.log('Teacher Shahd not found');
      return;
    }
    
    const sessions = await db.collection('sessions').find({ teacher_id: teacher._id.toString() }).toArray();
    console.log(JSON.stringify(sessions, null, 2));
    
  } finally {
    await client.close();
  }
}

main().catch(console.dir);
