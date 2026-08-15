import express from 'express';
import { getDB, ObjectId } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const studentRouter = express.Router();
const meetingsRouter = express.Router();
const reviewsRouter = express.Router();
const sessionsRouter = express.Router();

// GET /api/student/dashboard
studentRouter.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const db = getDB();
    const user = await db.collection('users').findOne({ _id: new ObjectId(req.userId) });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    const scheduled = await db.collection('scheduled_sessions').find({ student_id: req.userId, active: true }).toArray();

    for (const s of scheduled) {
      s._id = s._id.toString();
      s.student_phone = user.phone || '';
      if (s.teacher_id) {
        try {
          const teacher = await db.collection('users').findOne({ _id: new ObjectId(s.teacher_id) });
          if (teacher) {
            s.zoom_link = teacher.zoom_link || '';
            s.google_meet_link = teacher.google_meet_link || '';
          }
        } catch {}
      }
    }

    const sessions = await db.collection('sessions').find({ student_id: req.userId }).sort({ date: -1 }).limit(20).toArray();
    const reviews = await db.collection('reviews').find({ student_id: req.userId }, { projection: { session_id: 1 } }).toArray();
    const reviewedIds = new Set(reviews.map((r) => r.session_id ? r.session_id.toString() : ''));

    const recent = sessions.map((s) => {
      const sid = s._id.toString();
      return {
        ...s,
        _id: sid,
        reviewed: reviewedIds.has(sid),
      };
    });

    return res.json({
      success: true,
      data: {
        scheduled,
        recent_sessions: recent,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/student/slots
studentRouter.get('/slots', authMiddleware, async (req, res) => {
  try {
    const db = getDB();
    const slots = await db.collection('student_slots').find({ student_id: req.userId }).toArray();
    return res.json({ success: true, data: slots.map((s) => ({ ...s, _id: s._id.toString() })) });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/student/slots
studentRouter.put('/slots', authMiddleware, async (req, res) => {
  try {
    const db = getDB();
    const newSlots = req.body.slots || [];

    await db.collection('student_slots').deleteMany({ student_id: req.userId });

    if (newSlots.length > 0) {
      const docs = newSlots.map((s) => ({
        student_id: req.userId,
        day: s.day,
        start_time: s.start_time,
        end_time: s.end_time,
        created_at: new Date(),
      }));
      await db.collection('student_slots').insertMany(docs);
    }

    return res.json({ success: true, message: 'Slots saved successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Meetings API (/api/meetings)
meetingsRouter.post('/create', authMiddleware, async (req, res) => {
  try {
    const db = getDB();
    const roomId = `fosselat-${new ObjectId().toString()}`;

    await db.collection('meetings').insertOne({
      room_id: roomId,
      teacher_id: req.body.teacher_id || '',
      student_id: req.body.student_id || '',
      start_time: new Date(),
      end_time: null,
      active: true,
    });

    return res.json({ success: true, data: { room_id: roomId } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

meetingsRouter.post('/end', authMiddleware, async (req, res) => {
  try {
    const db = getDB();
    await db.collection('meetings').updateOne(
      { room_id: req.body.room_id || '' },
      { $set: { end_time: new Date(), active: false } }
    );
    return res.json({ success: true, message: 'Meeting ended' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Reviews API (/api/reviews)
reviewsRouter.post('/', authMiddleware, async (req, res) => {
  try {
    const db = getDB();
    await db.collection('reviews').insertOne({
      session_id: req.body.session_id || req.body.room_id || '',
      student_id: req.userId,
      rating: parseInt(req.body.rating || 0, 10),
      comment: req.body.comment || '',
      created_at: new Date(),
    });

    return res.json({ success: true, message: 'Review submitted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Sessions API (/api/sessions)
sessionsRouter.get('/:session_id', authMiddleware, async (req, res) => {
  try {
    const db = getDB();
    let session;
    try {
      session = await db.collection('sessions').findOne({ _id: new ObjectId(req.params.session_id) });
    } catch {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }

    if (!session) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    session._id = session._id.toString();
    return res.json({ success: true, data: session });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export { studentRouter, meetingsRouter, reviewsRouter, sessionsRouter };
