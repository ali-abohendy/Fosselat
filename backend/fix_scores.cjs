const { MongoClient } = require('mongodb');

async function fix() {
  const MONGO_URI = 'mongodb+srv://mostafaapoqura1732003_db_user:kqjmQICcKnfFrJLj@cluster0.l217ixe.mongodb.net/fossclat?retryWrites=true&w=majority';
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db('fossclat');
  
  const tests = await db.collection('placement_tests').find({}).toArray();
  for (const t of tests) {
    if (t.level_scores && t.level_scores.length > 0) {
      const avg = t.level_scores.reduce((sum, lvl) => sum + (lvl.pct || 0), 0) / t.level_scores.length;
      const actualScore = Math.round(avg * 100);
      await db.collection('placement_tests').updateOne(
        { _id: t._id },
        { $set: { score: actualScore } }
      );
      console.log(`Fixed score for test ${t._id}: set to ${actualScore}%`);
    }
  }
  await client.close();
  console.log('Done fixing scores.');
}

fix();
