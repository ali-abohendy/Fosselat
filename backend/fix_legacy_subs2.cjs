const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://mostafaapoqura1732003_db_user:kqjmQICcKnfFrJLj@cluster0.l217ixe.mongodb.net/fossclat?retryWrites=true&w=majority';

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('fossclat');
    const allSubs = await db.collection('subscriptions').find({}).toArray();
    let updated = 0;
    
    for (const sub of allSubs) {
      if (!sub.students || sub.students.length === 0) continue;
      
      let changed = false;
      for (const s of sub.students) {
        if (s.total_minutes === undefined) {
          s.total_minutes = (s.total_lessons || 0) * (s.duration || 30);
          s.remaining_minutes = s.total_minutes - (s.used_lessons || 0) * (s.duration || 30);
          if (s.remaining_minutes < 0) s.remaining_minutes = 0;
          changed = true;
        } else if (s.remaining_minutes < 0 && (s.remaining_lessons || 0) > 0) {
          s.total_minutes = (s.total_lessons || 0) * (s.duration || 30);
          s.remaining_minutes = s.total_minutes - (s.used_lessons || 0) * (s.duration || 30);
          changed = true;
        }
      }
      
      if (changed) {
        const allDone = sub.students.every(s => (s.remaining_minutes || 0) <= 0);
        const newStatus = allDone ? 'completed' : 'active';
        
        await db.collection('subscriptions').updateOne({ _id: sub._id }, { 
          $set: { 
            students: sub.students,
            status: newStatus 
          } 
        });
        console.log(`Updated subscription ${sub._id}, status -> ${newStatus}`);
        updated++;
      }
    }
    console.log(`Finished checking. Updated ${updated} subscriptions.`);
  } finally {
    await client.close();
  }
}
run();
