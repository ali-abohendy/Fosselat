import express from 'express';
import { getDB, ObjectId } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// POST /api/enrollments
router.post('/', async (req, res) => {
  try {
    const { course_id, full_name, email, phone, user_id } = req.body || {};
    if (!course_id || !full_name || !email) {
      return res.status(400).json({ success: false, message: 'Missing required fields: course_id, full_name, email' });
    }

    const db = getDB();
    let course;
    try {
      course = await db.collection('courses').findOne({ _id: new ObjectId(course_id) });
    } catch {
      course = await db.collection('courses').findOne({ slug: course_id });
    }

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const enrollmentDoc = {
      user_id: user_id || '',
      course_id: course._id.toString(),
      full_name: full_name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone || '',
      created_at: new Date(),
    };

    const result = await db.collection('enrollments').insertOne(enrollmentDoc);

    return res.status(201).json({
      success: true,
      data: { enrollment_id: result.insertedId.toString() },
      message: 'Enrollment successful',
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/enrollments/my
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const db = getDB();
    const enrollments = await db.collection('enrollments').find({ user_id: req.userId }).toArray();

    const result = [];
    for (const e of enrollments) {
      let course = null;
      if (e.course_id) {
        try {
          course = await db.collection('courses').findOne({ _id: new ObjectId(e.course_id) });
        } catch {}
      }
      result.push({
        id: e._id.toString(),
        course_id: e.course_id,
        full_name: e.full_name,
        email: e.email,
        phone: e.phone,
        course: course ? {
          id: course._id.toString(),
          title: course.title,
          slug: course.slug,
          image: course.image,
          level: course.level,
        } : null,
      });
    }

    return res.json({ success: true, data: result });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
