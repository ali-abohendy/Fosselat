import dotenv from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb';

async function migrate() {
  const uri = 'mongodb+srv://mostafaapoqura1732003_db_user:kqjmQICcKnfFrJLj@cluster0.l217ixe.mongodb.net/fossclat?retryWrites=true&w=majority';
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('fossclat');
    
    const subs = await db.collection('subscriptions').find({ status: 'active' }).toArray();
    let migrated = 0;
    
    for (const sub of subs) {
      if (!sub.students) {
        // 1. Create students array
        const students = [{
          student_id: sub.student_id,
          rate: sub.student_rate,
          duration: sub.lesson_duration,
          lesson_charge: sub.lesson_charge,
          total_lessons: sub.total_lessons,
          used_lessons: sub.used_lessons,
          remaining_lessons: sub.remaining_lessons
        }];
        
        // 2. Retroactive search
        const unbilledSessions = await db.collection('sessions').find({
          student_family_id: sub.family_id,
          date: { $gte: sub.start_date },
          subscription_id: { $exists: false },
          status: { $in: ['present', 'absent'] }
        }).sort({ date: 1, start_time: 1 }).toArray();

        let updatedConsumed = sub.consumed_amount || 0;

        for (const sess of unbilledSessions) {
          const stIdx = students.findIndex(s => s.student_id === sess.student_id);
          if (stIdx !== -1) {
            const studentObj = students[stIdx];
            students[stIdx].used_lessons += 1;
            students[stIdx].remaining_lessons -= 1;
            updatedConsumed += studentObj.lesson_charge;
            
            await db.collection('sessions').updateOne(
              { _id: sess._id },
              { $set: { subscription_id: sub._id.toString(), lesson_charge: studentObj.lesson_charge } }
            );
          }
        }
        
        const allCompleted = students.every(s => s.remaining_lessons <= 0);
        const finalStatus = allCompleted ? 'completed' : 'active';
        
        await db.collection('subscriptions').updateOne(
          { _id: sub._id },
          { 
            $set: { 
              students: students,
              consumed_amount: updatedConsumed,
              remaining_balance: sub.payment_amount - updatedConsumed,
              status: finalStatus
            } 
          }
        );
        migrated++;
      }
    }
    console.log(`Migrated and retroactively fixed ${migrated} active subscriptions.`);
  } finally {
    await client.close();
  }
}

migrate();
