import express from 'express';
import { getDB, ObjectId } from '../db.js';
import { authMiddleware, teacherMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware, teacherMiddleware);

// GET /api/teacher/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const db = getDB();
    const userId = req.userId;

    const sessions = await db.collection('sessions').find({ teacher_id: userId }).toArray();
    let totalMinutes = 0;
    sessions.forEach((s) => {
      totalMinutes += s.duration_minutes || 0;
    });

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const rate = parseFloat(req.user.hourly_rate || 0);

    return res.json({
      success: true,
      data: {
        lessons: sessions.length,
        time_hours: hours,
        time_minutes: minutes,
        rate_hour: rate,
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
    const { student_id, duration, status, date, notes } = req.body || {};

    let student = null;
    if (student_id) {
      try { student = await db.collection('users').findOne({ _id: new ObjectId(student_id) }); } catch {}
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
      subject: student ? (student.subject || '') : '',
      duration: durStr,
      duration_minutes: durMinutes,
      status: status || 'present',
      date: date || new Date().toISOString(),
      notes: notes || '',
      start_time: new Date().toISOString(),
      end_time: '',
      meeting_room_id: '',
      last_updated: new Date(),
      created_at: new Date(),
    };

    const result = await db.collection('sessions').insertOne(sessionDoc);
    sessionDoc._id = result.insertedId.toString();

    return res.json({ success: true, data: sessionDoc });
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
    const scheduled = await db.collection('scheduled_sessions').find({ teacher_id: req.userId, active: true }).toArray();

    const data = scheduled.map((s) => ({
      ...s,
      _id: s._id.toString(),
      zoom_link: req.user.zoom_link || '',
      google_meet_link: req.user.google_meet_link || '',
    }));

    return res.json({ success: true, data });
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
