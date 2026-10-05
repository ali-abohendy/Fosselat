const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://mostafaapoqura1732003_db_user:kqjmQICcKnfFrJLj@cluster0.l217ixe.mongodb.net/fossclat?retryWrites=true&w=majority';

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('fossclat');
    const sessions = await db.collection('sessions').find({ date: { $regex: '^2026-10' } }).toArray();
    const students = await db.collection('users').find({ role: 'student' }).toArray();
    
    let total = 0;
    let totalWithDiscount = 0;
    
    const familyCounts = {};
    students.forEach(s => {
      if (s.student_id) familyCounts[s.student_id] = (familyCounts[s.student_id] || 0) + 1;
    });
    
    sessions.forEach(s => {
      const student = students.find(x => x._id.toString() === s.student_id || s.student_name.includes(x.full_name));
      if (!student) {
        console.log('Student not found for session:', s.student_name);
        return;
      }
      
      const rate = parseFloat(student.hourly_rate || 0);
      let dm = parseInt((s.duration || '').toString().replace(/\D/g, ''), 10);
      if (isNaN(dm) || dm <= 0) dm = s.duration_minutes || 0;
      
      total += (rate / 60) * dm;
      
      let dRate = rate;
      if (student.student_id && familyCounts[student.student_id] > 1) {
        dRate *= 0.9;
      }
      totalWithDiscount += (dRate / 60) * dm;
    });
    
    console.log('Total without discount:', total);
    console.log('Total with discount:', totalWithDiscount);
  } finally {
    await client.close();
  }
}
run();
