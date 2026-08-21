const { MongoClient } = require('mongodb');

async function run() {
  const uri = 'mongodb+srv://mostafaapoqura1732003_db_user:kqjmQICcKnfFrJLj@cluster0.l217ixe.mongodb.net/fossclat?retryWrites=true&w=majority';
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('fossclat');
    const tests = await db.collection('placement_tests').find({}).toArray();
    for (const t of tests) {
      if (t.total_levels === undefined) {
        // Fallback assuming 5 levels for both programs
        const total_levels = 5;
        let highest_mastered_id = 0;
        
        // If they had 20%, let's just make it 1/5th
        if (t.score > 0) {
           highest_mastered_id = Math.max(1, Math.round((t.score / 100) * total_levels));
        }
        
        await db.collection('placement_tests').updateOne(
          { _id: t._id },
          { $set: { total_levels, highest_mastered_id } }
        );
      }
    }
    console.log("Database patched successfully.");
  } finally {
    await client.close();
  }
}

run();
