import express from 'express';
import bcrypt from 'bcryptjs';
import { getDB, ObjectId } from '../db.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Apply auth + admin check to all admin routes
router.use(authMiddleware, adminMiddleware);

async function generateFamilyId(db, familyName) {
  const cleanFamily = (familyName || '').trim();
  const prefix = cleanFamily.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3).padEnd(3, 'X');

  const existing = await db.collection('users').findOne({
    family_name: new RegExp(`^${cleanFamily}$`, 'i'),
    student_id: { $exists: true },
  });

  if (existing && existing.student_id) {
    return existing.student_id;
  }

  const count = await db.collection('users').countDocuments({
    student_id: new RegExp(`^${prefix}`),
  });

  const seq = count + 1;
  return `${prefix}${String(seq).padStart(3, '0')}`;
}

async function generateCredentials(db, fullName, familyName, studentId = null) {
  const first = (fullName || 'user').toLowerCase().split(' ')[0].replace(/[^a-z]/g, '') || 'user';
  const family = (familyName || 'user').toLowerCase().replace(/[^a-z]/g, '') || 'user';

  let email = `${first}.${family}@fosselat.com`;
  let counter = 1;

  while (await db.collection('users').findOne({ email })) {
    email = `${first}.${family}${counter}@fosselat.com`;
    counter++;
  }

  const password = studentId
    ? `Fosselat_${studentId}`
    : `Fosselat_${first.charAt(0).toUpperCase() + first.slice(1)}${family.charAt(0).toUpperCase() + family.slice(1)}`;

  return { email, password };
}

// PUT /api/admin/attendance/:id
router.put('/attendance/:id', async (req, res) => {
  try {
    const db = getDB();
    const { status, subject, notes } = req.body;
    let updateFields = { last_updated: new Date() };
    if (status !== undefined) updateFields.status = status;
    if (subject !== undefined) updateFields.subject = Array.isArray(subject) ? subject.join(', ') : subject;
    if (notes !== undefined) updateFields.notes = notes;

    const result = await db.collection('sessions').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateFields }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    return res.json({ success: true, message: 'Updated successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/admin/attendance/:id
router.delete('/attendance/:id', async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection('sessions').deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 1) {
      return res.json({ success: true, message: 'Attendance record deleted' });
    }
    return res.status(404).json({ success: false, message: 'Record not found' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/admin/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const db = getDB();
    const period = req.query.period || 'all_time';
    const now = new Date();

    let matchSession = {};
    let matchSp = {};
    let matchTp = {};

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const periodParts = period.split(' ');
    if (periodParts.length === 2 && monthNames.includes(periodParts[0])) {
      const mIndex = monthNames.indexOf(periodParts[0]);
      const y = parseInt(periodParts[1]);
      if (!isNaN(y)) {
        const prefix = `${y}-${String(mIndex + 1).padStart(2, '0')}`;
        matchSession = { date: new RegExp(`^${prefix}`) };
        matchSp = { month: period };
        matchTp = { month: period };
      }
    }

    const active_students = await db.collection('users').countDocuments({ role: 'student', status: 'active' });
    const active_teachers = await db.collection('users').countDocuments({ role: 'teacher', status: 'active' });
    const inactive_teachers = await db.collection('users').countDocuments({ role: 'teacher', status: 'inactive' });

    const total_sessions = await db.collection('sessions').countDocuments(matchSession);
    const present_times = await db.collection('sessions').countDocuments({ ...matchSession, status: 'present' });
    const absent_times = await db.collection('sessions').countDocuments({ ...matchSession, status: 'absent' });

    // Aggregate teaching hours
    const pipeline = [];
    if (Object.keys(matchSession).length > 0) pipeline.push({ $match: matchSession });
    pipeline.push({ $group: { _id: null, total: { $sum: '$duration_minutes' } } });

    const hrsResult = await db.collection('sessions').aggregate(pipeline).toArray();
    const teaching_minutes = hrsResult.length > 0 ? (hrsResult[0].total || 0) : 0;

    // Student payments aggregation
    const spPipeline = [];
    if (Object.keys(matchSp).length > 0) spPipeline.push({ $match: matchSp });
    spPipeline.push({ $group: { _id: null, due: { $sum: '$total_due' }, paid: { $sum: '$amount_paid' }, remaining: { $sum: '$remaining' } } });

    const spResult = await db.collection('student_payments').aggregate(spPipeline).toArray();
    const total_due = spResult.length > 0 ? (spResult[0].due || 0) : 0;
    const total_paid = spResult.length > 0 ? (spResult[0].paid || 0) : 0;
    const remaining = spResult.length > 0 ? (spResult[0].remaining || 0) : 0;

    // Teacher payments aggregation
    const tpPipeline = [];
    if (Object.keys(matchTp).length > 0) tpPipeline.push({ $match: matchTp });
    tpPipeline.push({ $group: { _id: null, total: { $sum: '$total_salary' }, net_dollar: { $sum: '$net_salary' } } });

    const tpResult = await db.collection('teacher_payments').aggregate(tpPipeline).toArray();
    const total_payroll_le = tpResult.length > 0 ? (tpResult[0].total || 0) : 0;
    // The dashboard expects total_payroll to be in dollars, and net_salary in teacher_payments is L.E.
    // So we divide by 50 here. Wait, actually we can just sum net_salary and divide by 50.
    const net_salary_sum = tpResult.length > 0 ? (tpResult[0].net_dollar || 0) : 0;
    const total_payroll = Number((net_salary_sum / 50).toFixed(2));

    return res.json({
      success: true,
      data: {
        active_students,
        total_sessions,
        total_due,
        active_teachers,
        inactive_teachers,
        total_paid,
        teaching_hours: Number((teaching_minutes / 60).toFixed(1)),
        absent_times,
        present_times,
        balance: total_paid - total_payroll,
        total_payroll,
        total_payroll_le,
        revenue: Number((total_paid + remaining - total_payroll).toFixed(2)),
        remaining,
      },
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Students CRUD
router.get('/students', async (req, res) => {
  try {
    const db = getDB();
    const students = await db.collection('users').find({ role: 'student' }, { projection: { password: 0 } }).toArray();
    const data = students.map((s) => ({
      ...s,
      _id: s._id.toString(),
      teacher_id: s.teacher_id ? s.teacher_id.toString() : '',
    }));
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/students', async (req, res) => {
  try {
    const { full_name, family_name, teacher_id, teacher_name, program, plan, class_duration, hourly_rate, status, phone, start_date, age } = req.body || {};
    if (!full_name || !family_name) {
      return res.status(400).json({ success: false, message: 'Name and family name are required' });
    }

    const db = getDB();
    const student_id = await generateFamilyId(db, family_name);
    const { email, password } = await generateCredentials(db, full_name, family_name, student_id);

    const hashedPassword = await bcrypt.hash(password, 10);
    const studentDoc = {
      full_name: full_name.trim(),
      family_name: family_name.trim(),
      student_id,
      email,
      password: hashedPassword,
      plain_password: password,
      teacher_id: teacher_id || '',
      teacher_name: teacher_name || '',
      program: program || '',
      plan: plan || '',
      class_duration: class_duration || '',
      hourly_rate: parseFloat(hourly_rate || 0),
      phone: phone || '',
      age: age || null,
      start_date: start_date || '',
      role: 'student',
      created_at: new Date(),
    };

    const result = await db.collection('users').insertOne(studentDoc);

    return res.json({
      success: true,
      data: {
        _id: result.insertedId.toString(),
        student_id,
        email,
        generated_password: password,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error creating student' });
  }
});

router.put('/students/:sid', async (req, res) => {
  try {
    const db = getDB();
    const updateData = { ...req.body };
    const newPassword = updateData.password;
    
    delete updateData._id;
    delete updateData.password;
    delete updateData.role;
    delete updateData.student_id;

    if (!updateData.email) delete updateData.email;
    
    if (newPassword && newPassword.length >= 8) {
      updateData.password = await bcrypt.hash(newPassword, 10);
      updateData.plain_password = newPassword;
      updateData.generated_password = newPassword;
    }

    if (updateData.age === '') updateData.age = null;

    if (updateData.hourly_rate !== undefined) {
      updateData.hourly_rate = parseFloat(updateData.hourly_rate || 0);
    }

    await db.collection('users').updateOne({ _id: new ObjectId(req.params.sid) }, { $set: updateData });
    return res.json({ success: true, message: 'Student updated' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error updating student' });
  }
});

// Teachers CRUD
router.get('/teachers', async (req, res) => {
  try {
    const db = getDB();
    const teachers = await db.collection('users').find({ role: 'teacher' }, { projection: { password: 0 } }).toArray();
    const data = teachers.map((t) => ({ ...t, _id: t._id.toString() }));
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/teachers', async (req, res) => {
  try {
    const { full_name, family_name, hourly_rate, zoom_link, google_meet_link, status } = req.body || {};
    if (!full_name) {
      return res.status(400).json({ success: false, message: 'Teacher name is required' });
    }

    const db = getDB();
    const { email, password } = await generateCredentials(db, full_name, family_name || '', null);
    const hashedPassword = await bcrypt.hash(password, 10);

    const teacherDoc = {
      full_name: full_name.trim(),
      family_name: (family_name || '').trim(),
      email,
      password: hashedPassword,
      plain_password: password,
      status: status || 'active',
      hourly_rate: parseFloat(hourly_rate || 0),
      zoom_link: zoom_link || '',
      google_meet_link: google_meet_link || '',
      role: 'teacher',
      created_at: new Date(),
    };

    const result = await db.collection('users').insertOne(teacherDoc);
    return res.json({
      success: true,
      data: {
        _id: result.insertedId.toString(),
        email,
        generated_password: password,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error creating teacher' });
  }
});

router.put('/teachers/:tid', async (req, res) => {
  try {
    const db = getDB();
    const updateData = { ...req.body };
    const newPassword = updateData.password;
    
    delete updateData._id;
    delete updateData.password;
    delete updateData.role;
    
    if (!updateData.email) delete updateData.email;
    
    if (newPassword && newPassword.length >= 8) {
      updateData.password = await bcrypt.hash(newPassword, 10);
      updateData.plain_password = newPassword;
      updateData.generated_password = newPassword;
    }

    if (updateData.hourly_rate !== undefined) {
      updateData.hourly_rate = parseFloat(updateData.hourly_rate || 0);
    }

    await db.collection('users').updateOne({ _id: new ObjectId(req.params.tid) }, { $set: updateData });
    return res.json({ success: true, message: 'Teacher updated' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Calendar
router.get('/calendar', async (req, res) => {
  try {
    const db = getDB();
    const { year, month, filter_by, filter_value, teacher_id, student_id } = req.query;

    const query = {};
    if (filter_by === 'teacher' && filter_value) query.teacher_id = filter_value;
    else if (filter_by === 'student' && filter_value) query.student_id = filter_value;
    else if (filter_by === 'subject' && filter_value) query.subject = filter_value;
    
    if (teacher_id) query.teacher_id = teacher_id;
    if (student_id) query.student_id = student_id;

    if (year && month) {
      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month, 1).toISOString().split('T')[0];
      query.date = { $gte: startDate, $lt: endDate };
    }

    const scheduled = await db.collection('scheduled_sessions').find({ 
      ...query, 
      active: true,
      date: undefined // scheduled_sessions don't have date, they have days of week, so we remove the date filter
    }).toArray();

    // Re-apply the actual date filter to the scheduled_sessions query is meaningless, they are recurring.
    const scheduledQuery = { ...query };
    delete scheduledQuery.date;
    const allScheduled = await db.collection('scheduled_sessions').find({ ...scheduledQuery, active: true }).toArray();

    const data = allScheduled.map((s) => ({
      ...s,
      _id: s._id.toString()
    }));

    const past_sessions = await db.collection('sessions').find(query).toArray();
    
    // Fetch all reviews for these sessions
    const sessionIds = past_sessions.map(s => s._id.toString());
    const reviews = await db.collection('reviews').find({ session_id: { $in: sessionIds } }).toArray();
    const reviewMap = {};
    reviews.forEach(r => {
      reviewMap[r.session_id] = r;
    });

    const past = past_sessions.map(s => ({
      ...s, 
      _id: s._id.toString(),
      student_review: reviewMap[s._id.toString()] || null
    }));

    return res.json({ success: true, data: { scheduled: data, past_sessions: past } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Attendance
router.get('/attendance', async (req, res) => {
  try {
    const db = getDB();
    const { filter_by, filter_value, teacher_id, student_id, month } = req.query;

    const query = {};
    if (filter_by === 'teacher' && filter_value) query.teacher_id = filter_value;
    else if (filter_by === 'student' && filter_value) query.student_id = filter_value;
    else if (filter_by === 'subject' && filter_value) query.subject = filter_value;
    else if (filter_by === 'month' && filter_value) query.date = new RegExp(`^${filter_value}`);

    if (teacher_id) query.teacher_id = teacher_id;
    if (student_id) query.student_id = student_id;
    if (month) query.date = new RegExp(`^${month}`);

    const sessions = await db.collection('sessions').find(query).sort({ last_updated: -1 }).toArray();
    
    // Fetch all reviews for these sessions
    const sessionIds = sessions.map(s => s._id.toString());
    const reviews = await db.collection('reviews').find({ session_id: { $in: sessionIds } }).toArray();
    const reviewMap = {};
    reviews.forEach(r => {
      reviewMap[r.session_id] = r;
    });

    const data = sessions.map((s) => ({
      ...s,
      _id: s._id.toString(),
      teacher_id: s.teacher_id ? s.teacher_id.toString() : '',
      student_id: s.student_id ? s.student_id.toString() : '',
      student_review: reviewMap[s._id.toString()] || null,
    }));

    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Schedule
router.get('/schedule', async (req, res) => {
  try {
    const db = getDB();
    const slots = await db.collection('time_slots').find().toArray();
    for (const s of slots) {
      s._id = s._id.toString();
      if (s.teacher_id) {
        try {
          const teacher = await db.collection('users').findOne({ _id: new ObjectId(s.teacher_id) });
          s.teacher_name = teacher ? teacher.full_name : 'Unknown';
        } catch {
          s.teacher_name = 'Unknown';
        }
      }
    }

    const scheduled = await db.collection('scheduled_sessions').find().sort({ created_at: -1 }).toArray();
    const scheduledData = scheduled.map((s) => ({ ...s, _id: s._id.toString() }));

    return res.json({ success: true, data: { slots, scheduled: scheduledData } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/schedule', async (req, res) => {
  try {
    const { teacher_id, student_id, subject, day, start_time, end_time, duration, timezone_diff } = req.body || {};
    const db = getDB();

    let teacher = null;
    let student = null;

    if (teacher_id) {
      try { teacher = await db.collection('users').findOne({ _id: new ObjectId(teacher_id) }); } catch {}
    }
    if (student_id) {
      try { student = await db.collection('users').findOne({ _id: new ObjectId(student_id) }); } catch {}
    }

    const roomId = `fosselat-${new ObjectId().toString()}`;
    const sessionDoc = {
      teacher_id: teacher_id || '',
      teacher_name: teacher ? teacher.full_name : '',
      student_id: student_id || '',
      student_name: student ? student.full_name : '',
      student_family_name: student ? (student.family_name || '') : '',
      student_family_id: student ? (student.student_id || '') : '',
      subject: (student && student.subject) ? student.subject : (subject || ''),
      day: day || '',
      start_time: start_time || '',
      end_time: end_time || '',
      duration: duration || '60 min',
      timezone_diff: timezone_diff || '',
      meeting_room_id: roomId,
      recurring: true,
      active: true,
      created_at: new Date(),
    };

    const result = await db.collection('scheduled_sessions').insertOne(sessionDoc);
    sessionDoc._id = result.insertedId.toString();

    return res.json({ success: true, data: sessionDoc });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/schedule/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { teacher_id, student_id, day, start_time, end_time, duration, timezone_diff } = req.body || {};
    const db = getDB();

    let teacher = null;
    let student = null;

    if (teacher_id) {
      try { teacher = await db.collection('users').findOne({ _id: new ObjectId(teacher_id) }); } catch {}
    }
    if (student_id) {
      try { student = await db.collection('users').findOne({ _id: new ObjectId(student_id) }); } catch {}
    }

    const updateDoc = {
      teacher_id: teacher_id || '',
      teacher_name: teacher ? teacher.full_name : '',
      student_id: student_id || '',
      student_name: student ? student.full_name : '',
      student_family_name: student ? (student.family_name || '') : '',
      student_family_id: student ? (student.student_id || '') : '',
      subject: (student && student.subject) ? student.subject : '',
      day: day || '',
      start_time: start_time || '',
      end_time: end_time || '',
      duration: duration || '60 min',
      timezone_diff: timezone_diff || '',
      updated_at: new Date(),
    };

    const result = await db.collection('scheduled_sessions').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateDoc },
      { returnDocument: 'after' }
    );

    if (!result) return res.status(404).json({ success: false, message: 'Session not found' });
    
    const updated = { ...result, _id: result._id.toString() };
    return res.json({ success: true, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/schedule/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDB();
    const result = await db.collection('scheduled_sessions').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) return res.status(404).json({ success: false, message: 'Session not found' });
    return res.json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Payments: Students
router.get('/payments/students', async (req, res) => {
  try {
    const db = getDB();
    const payments = await db.collection('student_payments').find().sort({ created_at: -1 }).toArray();
    return res.json({ success: true, data: payments.map((p) => ({ ...p, _id: p._id.toString() })) });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/payments/students', async (req, res) => {
  try {
    const { family_id, members, month, total_due, amount_paid, remaining, status } = req.body || {};
    const db = getDB();

    const existing = await db.collection('student_payments').findOne({ family_id, month });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Payment record for this family and month already exists' });
    }

    await db.collection('student_payments').insertOne({
      family_id: family_id || '',
      members: members || '',
      month: month || '',
      total_due: parseFloat(total_due || 0),
      amount_paid: parseFloat(amount_paid || 0),
      remaining: parseFloat(remaining || 0),
      status: status || 'unpaid',
      created_at: new Date(),
    });

    return res.json({ success: true, message: 'Payment recorded' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/payments/students/:pid', async (req, res) => {
  try {
    const db = getDB();
    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.created_at;

    ['total_due', 'amount_paid', 'remaining'].forEach((f) => {
      if (updateData[f] !== undefined) updateData[f] = parseFloat(updateData[f] || 0);
    });

    await db.collection('student_payments').updateOne({ _id: new ObjectId(req.params.pid) }, { $set: updateData });
    return res.json({ success: true, message: 'Payment updated' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/payments/students/:pid', async (req, res) => {
  try {
    const db = getDB();
    await db.collection('student_payments').deleteOne({ _id: new ObjectId(req.params.pid) });
    return res.json({ success: true, message: 'Payment record deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Payments: Teachers
router.get('/payments/teachers', async (req, res) => {
  try {
    const db = getDB();
    const payments = await db.collection('teacher_payments').find().sort({ created_at: -1 }).toArray();
    return res.json({
      success: true,
      data: payments.map((p) => ({
        ...p,
        _id: p._id.toString(),
        teacher_id: p.teacher_id ? p.teacher_id.toString() : '',
      })),
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/payments/teachers', async (req, res) => {
  try {
    const { teacher_id, teacher_name, month, time_hours, total_salary, bonuses, deductions, net_salary } = req.body || {};
    const db = getDB();

    const existing = await db.collection('teacher_payments').findOne({ teacher_id, month });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Payroll record for this teacher and month already exists' });
    }

    await db.collection('teacher_payments').insertOne({
      teacher_id: teacher_id || '',
      teacher_name: teacher_name || '',
      month: month || '',
      time_hours: parseFloat(time_hours || 0),
      total_salary: parseFloat(total_salary || 0),
      bonuses: parseFloat(bonuses || 0),
      deductions: parseFloat(deductions || 0),
      net_salary: parseFloat(net_salary || 0),
      created_at: new Date(),
    });

    return res.json({ success: true, message: 'Payroll recorded' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/payments/teachers/:pid', async (req, res) => {
  try {
    const db = getDB();
    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.created_at;

    ['time_hours', 'total_salary', 'bonuses', 'deductions', 'net_salary'].forEach((f) => {
      if (updateData[f] !== undefined) updateData[f] = parseFloat(updateData[f] || 0);
    });

    await db.collection('teacher_payments').updateOne({ _id: new ObjectId(req.params.pid) }, { $set: updateData });
    return res.json({ success: true, message: 'Payroll updated' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/payments/teachers/:pid', async (req, res) => {
  try {
    const db = getDB();
    await db.collection('teacher_payments').deleteOne({ _id: new ObjectId(req.params.pid) });
    return res.json({ success: true, message: 'Payroll record deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE Student
router.delete('/students/:sid', async (req, res) => {
  try {
    const db = getDB();
    const sid = req.params.sid;
    await db.collection('users').deleteOne({ _id: new ObjectId(sid) });
    await db.collection('time_slots').deleteMany({ student_id: sid });
    await db.collection('scheduled_sessions').deleteMany({ student_id: sid });
    return res.json({ success: true, message: 'Student and related schedule deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE Teacher
router.delete('/teachers/:tid', async (req, res) => {
  try {
    const db = getDB();
    const tid = req.params.tid;
    await db.collection('users').deleteOne({ _id: new ObjectId(tid) });
    await db.collection('time_slots').deleteMany({ teacher_id: tid });
    await db.collection('scheduled_sessions').deleteMany({ teacher_id: tid });
    return res.json({ success: true, message: 'Teacher and related schedule deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
