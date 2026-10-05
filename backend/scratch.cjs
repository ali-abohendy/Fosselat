const { MongoClient, ObjectId } = require('mongodb');

async function run() {
  const client = new MongoClient('mongodb+srv://mostafaapoqura1732003_db_user:kqjmQICcKnfFrJLj@cluster0.l217ixe.mongodb.net/fossclat?retryWrites=true&w=majority');
  await client.connect();
  const db = client.db('fossclat');

  const allLinkedSessions = await db.collection('sessions').find({ subscription_id: { $exists: true } }).toArray();
  const usageMap = {};
  for (const sess of allLinkedSessions) {
    if (!sess.student_id) continue;
    const key = `${sess.subscription_id}_${sess.student_id.toString()}`;
    let dm = parseInt((sess.duration || '').toString().replace(/\D/g, ''), 10);
    if (isNaN(dm) || dm <= 0) dm = sess.duration_minutes || 0;
    if (!usageMap[key]) usageMap[key] = 0;
    usageMap[key] += dm;
  }

  const subs = await db.collection('subscriptions').find({ status: 'active' }).toArray();
  for (const s of subs) {
    const subId = s._id.toString();
    const updatedStudents = (s.students || []).map(st => {
      const key = `${subId}_${st.student_id}`;
      return {
        family: s.family_id,
        student_id: st.student_id,
        actual_used_minutes: usageMap[key] || 0
      };
    });
    console.log(updatedStudents);
  }

  process.exit(0);
}
run();
