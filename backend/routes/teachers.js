import express from 'express';
import { getDB, ObjectId } from '../db.js';

const router = express.Router();

function serializeTeacher(t) {
  if (!t) return null;
  return {
    id: t._id.toString(),
    name: t.name || t.full_name || '',
    title: t.title || '',
    bio: t.bio || '',
    experience_years: t.experience_years || 0,
    image: t.image || '',
    specializations: t.specializations || [],
  };
}

// GET /api/teachers
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const teachers = await db.collection('teachers').find().toArray();
    return res.json({
      success: true,
      data: teachers.map(serializeTeacher),
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/teachers/:teacher_id
router.get('/:teacher_id', async (req, res) => {
  try {
    const db = getDB();
    const teacher = await db.collection('teachers').findOne({ _id: new ObjectId(req.params.teacher_id) });
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }
    return res.json({ success: true, data: serializeTeacher(teacher) });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
