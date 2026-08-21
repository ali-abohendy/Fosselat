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

    // Calculate Billing Cycle sessions
    let sessionsTakenThisCycle = 0;
    let remainingSessionsThisCycle = 0;
    let cycleStartDate = null;
    let cycleEndDate = null;

    if (user.start_date) {
      const startDt = new Date(user.start_date);
      const startDay = startDt.getDate();
      const now = new Date();
      
      // Determine the current cycle's start and end dates
      cycleStartDate = new Date(now.getFullYear(), now.getMonth(), startDay);
      if (now.getDate() < startDay) {
        cycleStartDate.setMonth(cycleStartDate.getMonth() - 1);
      }
      cycleEndDate = new Date(cycleStartDate.getFullYear(), cycleStartDate.getMonth() + 1, startDay);
      
      // Query how many actual sessions were taken in this exact timeframe
      sessionsTakenThisCycle = await db.collection('sessions').countDocuments({
        student_id: req.userId,
        date: {
          $gte: cycleStartDate.toISOString().split('T')[0],
          $lt: cycleEndDate.toISOString().split('T')[0]
        }
      });
      
      // Remaining calculation
      const weeklyClassesCount = scheduled.length;
      remainingSessionsThisCycle = Math.max(0, (weeklyClassesCount * 4) - sessionsTakenThisCycle);
    }

    return res.json({
      success: true,
      data: {
        scheduled,
        recent_sessions: recent,
        cycle: {
          start_date: cycleStartDate,
          end_date: cycleEndDate,
          sessions_taken: sessionsTakenThisCycle,
          remaining_sessions: remainingSessionsThisCycle
        }
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/student/calendar
studentRouter.get('/calendar', authMiddleware, async (req, res) => {
  try {
    const db = getDB();
    const { year, month } = req.query; // 1-indexed month (1=Jan)
    
    // 1. Get scheduled
    const user = await db.collection('users').findOne({ _id: new ObjectId(req.userId) });
    const scheduled = await db.collection('scheduled_sessions').find({ student_id: req.userId, active: true }).toArray();

    for (const s of scheduled) {
      s._id = s._id.toString();
      s.student_phone = user?.phone || '';
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

    // 2. Get past sessions for this month
    let query = { student_id: req.userId };
    if (year && month) {
      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month, 1).toISOString().split('T')[0];
      query.date = { $gte: startDate, $lt: endDate };
    }
    
    const past_sessions = await db.collection('sessions').find(query).toArray();
    
    // map past_sessions to strings
    const past = past_sessions.map(s => ({...s, _id: s._id.toString()}));

    return res.json({ success: true, data: { scheduled, past_sessions: past } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/student/sessions
studentRouter.get('/sessions', authMiddleware, async (req, res) => {
  try {
    const db = getDB();
    const sessions = await db.collection('sessions').find({ student_id: req.userId }).sort({ date: -1, start_time: -1 }).toArray();
    
    // Attach reviews
    const reviews = await db.collection('reviews').find({ student_id: req.userId }).toArray();
    const reviewMap = {};
    reviews.forEach(r => { reviewMap[r.session_id] = r; });

    const data = sessions.map(s => {
      const sid = s._id.toString();
      return { ...s, _id: sid, review: reviewMap[sid] || null };
    });

    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/student/placement_tests
studentRouter.get('/placement_tests', authMiddleware, async (req, res) => {
  try {
    const db = getDB();
    const tests = await db.collection('placement_tests').find({ student_id: req.userId }).sort({ created_at: -1 }).toArray();
    return res.json({ success: true, data: tests.map(t => ({...t, _id: t._id.toString()})) });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/student/placement_tests
studentRouter.post('/placement_tests', authMiddleware, async (req, res) => {
  try {
    const db = getDB();
    const resultData = req.body.results;
    if (!resultData) return res.status(400).json({ success: false, message: 'Missing results' });
    
    // Compute an overall score out of 100 if not provided
    let finalScore = resultData.score || 0;
    if (!resultData.score && resultData.levelScores && resultData.levelScores.length > 0) {
      const sumPct = resultData.levelScores.reduce((acc, ls) => acc + (ls.pct || 0), 0);
      finalScore = Math.round((sumPct / resultData.levelScores.length) * 100);
    }
    
    await db.collection('placement_tests').insertOne({
      student_id: req.userId,
      track: resultData.trackLabel || resultData.track,
      program: resultData.programLabel || resultData.program,
      recommended_level: resultData.recommendedLevel || (resultData.level ? resultData.level.name : null),
      highest_mastered_id: resultData.highestMastered || resultData.highestMasteredId || 0,
      total_levels: resultData.totalLevels || 4,
      score: finalScore,
      level_scores: resultData.levelScores,
      created_at: new Date()
    });
    return res.json({ success: true, message: 'Test saved' });
  } catch (err) {
    console.error('Failed to save test:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/student/placement_tests/:id
studentRouter.delete('/placement_tests/:id', authMiddleware, async (req, res) => {
  try {
    const db = getDB();
    const testId = req.params.id;
    // Ensure the test belongs to the authenticated user
    const result = await db.collection('placement_tests').deleteOne({
      _id: new ObjectId(testId),
      student_id: req.userId
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Test not found or unauthorized' });
    }

    return res.json({ success: true, message: 'Test deleted successfully' });
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
    const session_id = req.body.session_id || req.body.room_id || '';
    if (!session_id) {
      return res.status(400).json({ success: false, message: 'Session ID is required' });
    }

    await db.collection('reviews').updateOne(
      { session_id, student_id: req.userId },
      {
        $set: {
          rating: parseInt(req.body.rating || 0, 10),
          comment: req.body.comment || '',
          last_updated: new Date(),
        },
        $setOnInsert: { created_at: new Date() }
      },
      { upsert: true }
    );

    return res.json({ success: true, message: 'Review saved' });
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

    const review = await db.collection('reviews').findOne({ session_id: session._id.toString(), student_id: req.userId });
    session.review = review || null;

    session._id = session._id.toString();
    return res.json({ success: true, data: session });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export { studentRouter, meetingsRouter, reviewsRouter, sessionsRouter };
