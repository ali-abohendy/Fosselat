import express from 'express';
import { getDB, ObjectId } from '../db.js';
import { authMiddleware, teacherMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware, teacherMiddleware);

// GET /api/teacher/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const db = getDB();
    const period = req.query.period || 'month';
    const userId = req.userId;
    let matchSession = { teacher_id: userId };

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const periodParts = period.split(' ');
    if (periodParts.length === 2 && monthNames.includes(periodParts[0])) {
      const mIndex = monthNames.indexOf(periodParts[0]);
      const y = parseInt(periodParts[1]);
      if (!isNaN(y)) {
        const prefix = `${y}-${String(mIndex + 1).padStart(2, '0')}`;
        matchSession.date = new RegExp(`^${prefix}`);
      }
    }

    const sessions = await db.collection('sessions').find(matchSession).toArray();
    let totalMinutes = 0;
    sessions.forEach((s) => {
      totalMinutes += s.duration_minutes || 0;
    });

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const rate = parseFloat(req.user.hourly_rate || 0);
    const calculated_payroll = Number(((totalMinutes / 60) * rate).toFixed(2));

    // Fetch bonuses and deductions from teacher_payments
    let bonuses = 0;
    let deductions = 0;
    try {
      const payment = await db.collection('teacher_payments').findOne({
        teacher_id: userId,
        month: period
      });
      if (payment) {
        bonuses = payment.bonuses || 0;
        deductions = payment.deductions || 0;
      }
    } catch (e) {
      // Ignore errors here
    }

    return res.json({
      success: true,
      data: {
        lessons: sessions.length,
        time_hours: hours,
        time_minutes: minutes,
        rate_hour: rate,
        payroll: calculated_payroll,
        bonuses,
        deductions
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/teacher/students
router.get('/students', async (req, res) => {
  try {
    const db = getDB();
    const teacherName = req.user.full_name || '';
    const userId = req.userId;

    let students = await db.collection('users').find(
      {
        role: 'student',
        $or: [{ teacher_name: teacherName }, { teacher_id: userId }],
      },
      { projection: { password: 0 } }
    ).toArray();

    if (!students || students.length === 0) {
      students = await db.collection('users').find({ role: 'student' }, { projection: { password: 0 } }).toArray();
    }

    const data = students.map((s) => ({ ...s, _id: s._id.toString() }));
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/teacher/sessions
router.post('/sessions', async (req, res) => {
  try {
    const db = getDB();
    let { student_id, duration, status, date, notes, subject, start_time, end_time } = req.body || {};

    let student = null;
    if (student_id) {
      try { student = await db.collection('users').findOne({ _id: new ObjectId(student_id) }); } catch {}
    }

    if (!date) {
      date = new Date().toISOString().split('T')[0];
    } else {
      date = date.split('T')[0]; // ensure just the YYYY-MM-DD part if possible
    }

    // Check if session already recorded for this student on this date
    const existingSession = await db.collection('sessions').findOne({
      teacher_id: req.userId,
      student_id: student_id || '',
      date: date
    });

    if (existingSession) {
      return res.status(400).json({ success: false, message: 'A session has already been recorded for this student on this date.' });
    }

    const durStr = duration || '60 min';
    const durMinutes = parseInt(durStr.replace(/\D/g, ''), 10) || 60;

    const sessionDoc = {
      teacher_id: req.userId,
      teacher_name: req.user.full_name || '',
      student_id: student_id || '',
      student_name: student ? (student.full_name || '') : '',
      student_family_name: student ? (student.family_name || '') : '',
      student_family_id: student ? (student.student_id || '') : '',
      subject: Array.isArray(subject) ? subject.join(', ') : (subject || (student ? (student.subject || '') : '')),
      duration: durStr,
      duration_minutes: durMinutes,
      status: status || 'present',
      date: date || new Date().toISOString(),
      notes: notes || '',
      start_time: start_time || new Date().toISOString(),
      end_time: end_time || '',
      meeting_room_id: '',
      last_updated: new Date(),
      created_at: new Date(),
    };

    const result = await db.collection('sessions').insertOne(sessionDoc);
    sessionDoc._id = result.insertedId.toString();

    // Auto-update student and teacher payments if they exist
    try {
      const monthStr = new Date(date || new Date().toISOString()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      
      // Teacher payroll
      if (status === 'present' || status === 'absent') {
        const tp = await db.collection('teacher_payments').findOne({ teacher_id: req.userId, month: monthStr });
        if (tp) {
          const hoursAdded = durMinutes / 60;
          const newHours = (parseFloat(tp.time_hours || 0) + hoursAdded).toFixed(2);
          const rate = parseFloat(req.user.hourly_rate || 0);
          const newGross = (parseFloat(newHours) * rate).toFixed(2);
          const bonuses = parseFloat(tp.bonuses || 0);
          const deductions = parseFloat(tp.deductions || 0);
          const newNet = (parseFloat(newGross) + bonuses - deductions).toFixed(2);
          
          await db.collection('teacher_payments').updateOne(
            { _id: tp._id },
            { $set: { time_hours: parseFloat(newHours), total_salary: parseFloat(newGross), net_salary: parseFloat(newNet) } }
          );
        }
      }

      // Student payments
      if (student && student.student_id && (status === 'present' || status === 'absent')) {
        const sp = await db.collection('student_payments').findOne({ family_id: student.student_id, month: monthStr });
        if (sp) {
          const hoursAdded = durMinutes / 60;
          const rate = student.plan === 'elite' ? 9 : 10;
          const dueAdded = hoursAdded * rate;
          const newDue = (parseFloat(sp.total_due || 0) + dueAdded).toFixed(2);
          const amountPaid = parseFloat(sp.amount_paid || 0);
          const newRem = (parseFloat(newDue) - amountPaid).toFixed(2);
          
          let newStatus = 'unpaid';
          if (parseFloat(newDue) === 0 && amountPaid === 0) newStatus = 'paid';
          else if (amountPaid === 0) newStatus = 'unpaid';
          else if (parseFloat(newRem) <= 0) newStatus = amountPaid > parseFloat(newDue) ? 'credit' : 'paid';
          else newStatus = 'partial';
          
          await db.collection('student_payments').updateOne(
            { _id: sp._id },
            { $set: { total_due: parseFloat(newDue), remaining: parseFloat(newRem), status: newStatus } }
          );
        }
      }
    } catch (e) {
      console.error("Auto-update payments failed", e);
    }

    return res.json({ success: true, data: sessionDoc });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/teacher/sessions (Session History with Reviews)
router.get('/sessions', async (req, res) => {
  try {
    const db = getDB();
    const sessions = await db.collection('sessions').aggregate([
      { $match: { teacher_id: req.userId } },
      { $sort: { date: -1, start_time: -1 } },
      {
        $lookup: {
          from: 'reviews',
          let: { sessionId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$session_id', { $toString: '$$sessionId' }] } } }
          ],
          as: 'reviews'
        }
      }
    ]).toArray();

    return res.json({ success: true, data: sessions });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/teacher/sessions/:id
router.put('/sessions/:id', async (req, res) => {
  try {
    const db = getDB();
    const { notes, status, subject } = req.body;
    
    let updateFields = { last_updated: new Date() };
    if (notes !== undefined) updateFields.notes = notes;
    if (status !== undefined) updateFields.status = status;
    if (subject !== undefined) updateFields.subject = Array.isArray(subject) ? subject.join(', ') : subject;

    const result = await db.collection('sessions').updateOne(
      { _id: new ObjectId(req.params.id), teacher_id: req.userId },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: 'Session not found or unauthorized' });
    }

    return res.json({ success: true, message: 'Session updated' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/teacher/reports
router.post('/reports', async (req, res) => {
  try {
    const db = getDB();
    const { session_id, notes } = req.body || {};

    await db.collection('reports').insertOne({
      session_id: session_id || '',
      teacher_id: req.userId,
      teacher_name: req.user.full_name || '',
      notes: notes || '',
      created_at: new Date(),
    });

    return res.json({ success: true, message: 'Report saved' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/teacher/slots
router.get('/slots', async (req, res) => {
  try {
    const db = getDB();
    const slots = await db.collection('time_slots').find({ teacher_id: req.userId }).toArray();
    return res.json({ success: true, data: slots.map((s) => ({ ...s, _id: s._id.toString() })) });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/teacher/slots
router.put('/slots', async (req, res) => {
  try {
    const db = getDB();
    const slots = req.body.slots || [];

    await db.collection('time_slots').deleteMany({ teacher_id: req.userId });

    if (slots.length > 0) {
      const docs = slots.map((s) => ({
        ...s,
        teacher_id: req.userId,
      }));
      await db.collection('time_slots').insertMany(docs);
    }

    return res.json({ success: true, message: 'Slots updated' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/teacher/calendar
router.get('/calendar', async (req, res) => {
  try {
    const db = getDB();
    const { year, month } = req.query; // 1-indexed month (1=Jan)

    const scheduled = await db.collection('scheduled_sessions').find({ teacher_id: req.userId, active: true }).toArray();

    const data = scheduled.map((s) => ({
      ...s,
      _id: s._id.toString(),
      zoom_link: req.user.zoom_link || '',
      google_meet_link: req.user.google_meet_link || '',
    }));

    // Get past sessions for this month
    let query = { teacher_id: req.userId };
    if (year && month) {
      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month, 1).toISOString().split('T')[0];
      query.date = { $gte: startDate, $lt: endDate };
    }
    
    const past_sessions = await db.collection('sessions').find(query).toArray();
    const past = past_sessions.map(s => ({...s, _id: s._id.toString()}));

    return res.json({ success: true, data: { scheduled: data, past_sessions: past } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/teacher/session/:session_id/end
router.post('/session/:session_id/end', async (req, res) => {
  try {
    const db = getDB();
    await db.collection('sessions').updateOne(
      { _id: new ObjectId(req.params.session_id), teacher_id: req.userId },
      { $set: { end_time: new Date().toISOString(), status: 'completed' } }
    );
    return res.json({ success: true, message: 'Session ended' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
