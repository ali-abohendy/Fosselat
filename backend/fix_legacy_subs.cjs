const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://mostafaapoqura1732003_db_user:kqjmQICcKnfFrJLj@cluster0.l217ixe.mongodb.net/fossclat?retryWrites=true&w=majority';

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('fossclat');
    const completedSubs = await db.collection('subscriptions').find({ status: 'completed' }).toArray();
    let reverted = 0;
    for (const sub of completedSubs) {
      if (!sub.students || sub.students.length === 0) continue;
      const allDone = sub.students.every(s => {
        if (s.remaining_minutes !== undefined) return s.remaining_minutes <= 0;
        return (s.remaining_lessons || 0) <= 0;
      });
      if (!allDone) {
        await db.collection('subscriptions').updateOne({ _id: sub._id }, { $set: { status: 'active' } });
        console.log(`Reverted subscription ${sub._id} for family ${sub.family_id} back to active`);
        reverted++;
      }
    }
    console.log(`Finished checking. Reverted ${reverted} subscriptions.`);
  } finally {
    await client.close();
  }
}
run();
