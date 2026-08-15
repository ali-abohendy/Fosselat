import express from 'express';
import { getDB, ObjectId } from '../db.js';

const router = express.Router();

function serializeCourse(course) {
  if (!course) return null;
  return {
    id: course._id.toString(),
    title: course.title || '',
    slug: course.slug || '',
    description: course.description || '',
    short_description: course.short_description || '',
    icon: course.icon || 'BookOpen',
    image: course.image || '',
    level: course.level || 'Beginner',
    subjects: course.subjects || [],
    teacher_id: course.teacher_id ? course.teacher_id.toString() : '',
    is_popular: Boolean(course.is_popular),
    created_at: course.created_at ? new Date(course.created_at).toISOString() : null,
  };
}

function serializeTeacher(teacher) {
  if (!teacher) return null;
  return {
    id: teacher._id.toString(),
    name: teacher.name || teacher.full_name || '',
    title: teacher.title || '',
    bio: teacher.bio || '',
    experience_years: teacher.experience_years || 0,
    image: teacher.image || '',
    specializations: teacher.specializations || [],
  };
}

// GET /api/courses
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const courses = await db.collection('courses').find().toArray();
    return res.json({
      success: true,
      data: courses.map(serializeCourse),
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/courses/popular
router.get('/popular', async (req, res) => {
  try {
    const db = getDB();
    const courses = await db.collection('courses').find({ is_popular: true }).toArray();
    return res.json({
      success: true,
      data: courses.map(serializeCourse),
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/courses/:course_id
router.get('/:course_id', async (req, res) => {
  try {
    const db = getDB();
    let course;
    try {
      course = await db.collection('courses').findOne({ _id: new ObjectId(req.params.course_id) });
    } catch {
      course = await db.collection('courses').findOne({ slug: req.params.course_id });
    }

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const courseData = serializeCourse(course);

    if (course.teacher_id) {
      try {
        const teacher = await db.collection('teachers').findOne({ _id: new ObjectId(course.teacher_id) })
                     || await db.collection('users').findOne({ _id: new ObjectId(course.teacher_id) });
        if (teacher) {
          courseData.teacher = serializeTeacher(teacher);
        }
      } catch {}
    }

    return res.json({ success: true, data: courseData });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
