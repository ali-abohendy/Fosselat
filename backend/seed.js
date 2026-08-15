import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { connectDB, ObjectId } from './db.js';

dotenv.config();

async function seed() {
  const db = await connectDB();

  console.log('[Seed] Starting database seeding for Node.js backend...');

  // 1. Clear collections
  await db.collection('teachers').deleteMany({});
  await db.collection('courses').deleteMany({});
  await db.collection('users').deleteMany({});
  await db.collection('sessions').deleteMany({});
  await db.collection('reviews').deleteMany({});
  await db.collection('reports').deleteMany({});
  await db.collection('student_payments').deleteMany({});
  await db.collection('teacher_payments').deleteMany({});
  await db.collection('time_slots').deleteMany({});
  await db.collection('meetings').deleteMany({});
  await db.collection('scheduled_sessions').deleteMany({});

  console.log('[OK] Cleared old collections');

  // 2. Insert Teachers
  const teachersData = [
    {
      name: 'Ustadh Ahmed',
      title: 'Tajweed Expert',
      bio: 'Ustadh Ahmed is a certified Tajweed instructor with over 8 years of experience.',
      experience_years: 8,
      image: '/images/teachers/ustadh-ahmed.jpg',
      specializations: ['Tajweed', "Qur'an Recitation", 'Noorani Qaida'],
      created_at: new Date(),
    },
    {
      name: 'Ustadh Omar',
      title: "Qur'an Recitation Specialist",
      bio: 'Ustadh Omar has dedicated over 10 years to teaching Qur\'an recitation.',
      experience_years: 10,
      image: '/images/teachers/ustadh-omar.jpg',
      specializations: ["Qur'an Recitation", 'Arabic Phonetics', 'Maqamat'],
      created_at: new Date(),
    },
    {
      name: 'Ustadh Bilal',
      title: 'Hifz Specialist',
      bio: "Ustadh Bilal is a Hafiz of the Qur'an with over 6 years of experience.",
      experience_years: 6,
      image: '/images/teachers/ustadh-bilal.jpg',
      specializations: ['Hifz', 'Memorisation Techniques', 'Revision Strategies'],
      created_at: new Date(),
    },
  ];

  const teacherResult = await db.collection('teachers').insertMany(teachersData);
  const teacherIds = Object.values(teacherResult.insertedIds);
  console.log(`[OK] Inserted ${teacherIds.length} teachers`);

  // 3. Insert Courses
  const coursesData = [
    {
      title: 'Noorani Qaida',
      slug: 'noorani-qaida',
      description: "Master the fundamentals of Arabic letter recognition and pronunciation.",
      short_description: "Learn the Arabic alphabet and basic pronunciation rules.",
      icon: 'BookOpen',
      image: '/images/courses/noorani-qaida.jpg',
      level: 'Beginner',
      subjects: ['Arabic Alphabet', 'Letter Recognition', 'Basic Pronunciation'],
      teacher_id: teacherIds[0],
      is_popular: true,
      created_at: new Date(),
    },
    {
      title: 'Tajweed Rules',
      slug: 'tajweed-rules',
      description: "Deepen your recitation skills with a thorough study of Tajweed rules.",
      short_description: "Perfect your Qur'anic recitation by mastering the essential rules.",
      icon: 'Award',
      image: '/images/courses/tajweed-rules.jpg',
      level: 'Intermediate',
      subjects: ['Noon Sakinah & Tanween', 'Meem Sakinah Rules', 'Madd Rules'],
      teacher_id: teacherIds[0],
      is_popular: true,
      created_at: new Date(),
    },
    {
      title: 'Hifz Program',
      slug: 'hifz-program',
      description: "Embark on the rewarding journey of memorising the Holy Qur'an.",
      short_description: "A structured programme to help you memorise the Holy Qur'an.",
      icon: 'Star',
      image: '/images/courses/hifz-program.jpg',
      level: 'Advanced',
      subjects: ['Memorisation Techniques', 'Daily Revision Plan', 'Juz-by-Juz Progression'],
      teacher_id: teacherIds[2],
      is_popular: true,
      created_at: new Date(),
    },
  ];

  await db.collection('courses').insertMany(coursesData);
  console.log(`[OK] Inserted ${coursesData.length} courses`);

  // 4. Insert Test Users & Admins
  const adminId = new ObjectId();
  const teacherUserId = new ObjectId();
  const studentUserId = new ObjectId();

  const hashedDefaultPass = await bcrypt.hash('admin123', 10);
  const hashedTeacherPass = await bcrypt.hash('teacher123', 10);
  const hashedStudentPass = await bcrypt.hash('student123', 10);

  const usersData = [
    {
      _id: adminId,
      full_name: 'Admin User',
      family_name: 'Fosselat',
      email: 'admin@fosselat.com',
      password: hashedDefaultPass,
      role: 'admin',
      phone: '+201150243896',
      status: 'active',
      created_at: new Date(),
    },
    {
      _id: teacherUserId,
      full_name: 'Ustadh Ahmed',
      family_name: 'Hassan',
      email: 'teacher@fosselat.com',
      password: hashedTeacherPass,
      role: 'teacher',
      phone: '+201234567890',
      status: 'active',
      hourly_rate: 15,
      gross_salary: 2400,
      bonuses: 0,
      deductions: 0,
      net_salary: 2400,
      title: 'Tajweed Expert',
      bio: 'Certified Tajweed instructor with 8+ years experience.',
      specializations: ['Tajweed', 'Quran Recitation'],
      experience_years: 8,
      created_at: new Date(),
    },
    {
      _id: studentUserId,
      full_name: 'Ali',
      family_name: 'Hendy',
      student_id: 'HEN001',
      email: 'student@fosselat.com',
      password: hashedStudentPass,
      role: 'student',
      phone: '+201111111111',
      status: 'active',
      subject: 'Tajweed',
      program: 'quran',
      plan: 'growth',
      class_duration: '60',
      teacher_name: 'Ustadh Ahmed',
      teacher_id: teacherUserId.toString(),
      hourly_rate: 96,
      start_date: '2026-01-15',
      created_at: new Date(),
    },
  ];

  // Specific Admins
  const specificAdmins = [
    { email: 'amrabohendy@fosselat.com', password: 'amrabohendy123', full_name: 'Amr Abo Hendy' },
    { email: 'eidbayoumy@fosselat.com', password: 'eidbayoumy123', full_name: 'Eid Bayoumy' },
    { email: 'abdullahshehab@fosselat.com', password: 'abdullahshehab123', full_name: 'Abdullah Shehab' },
    { email: 'ahmeddaif@fosselat.com', password: 'ahmeddaif123', full_name: 'Ahmed Daif' },
  ];

  for (const adm of specificAdmins) {
    const passHash = await bcrypt.hash(adm.password, 10);
    usersData.push({
      _id: new ObjectId(),
      full_name: adm.full_name,
      family_name: 'Fosselat',
      email: adm.email,
      password: passHash,
      plain_password: adm.password,
      role: 'admin',
      status: 'active',
      created_at: new Date(),
    });
  }

  await db.collection('users').insertMany(usersData);
  console.log(`[OK] Inserted ${usersData.length} users (Admins, Teachers, Students)`);

  // 5. Time slots & scheduled session
  const timeSlots = [
    { teacher_id: teacherUserId.toString(), day: 'Monday', start_time: '09:00', end_time: '12:00' },
    { teacher_id: teacherUserId.toString(), day: 'Wednesday', start_time: '09:00', end_time: '12:00' },
    { teacher_id: teacherUserId.toString(), day: 'Friday', start_time: '14:00', end_time: '17:00' },
  ];
  await db.collection('time_slots').insertMany(timeSlots);

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayDay = days[new Date().getDay()];

  await db.collection('scheduled_sessions').insertOne({
    teacher_id: teacherUserId.toString(),
    teacher_name: 'Ustadh Ahmed',
    student_id: studentUserId.toString(),
    student_name: 'Ali',
    student_family_name: 'Hendy',
    student_family_id: 'HEN001',
    subject: 'Tajweed',
    day: todayDay,
    start_time: '10:00',
    end_time: '11:00',
    duration: '60 min',
    meeting_room_id: `fosselat-${new ObjectId().toString()}`,
    recurring: true,
    active: true,
    created_at: new Date(),
  });

  console.log('[OK] Inserted teacher time slots & scheduled sessions');
  console.log('');
  console.log('[COMPLETE] Node.js Database Seeding Completed!');
  console.log('Accounts ready:');
  console.log('  amrabohendy@fosselat.com / amrabohendy123');
  console.log('  eidbayoumy@fosselat.com / eidbayoumy123');
  console.log('  abdullahshehab@fosselat.com / abdullahshehab123');
  console.log('  ahmeddaif@fosselat.com / ahmeddaif123');
  console.log('  admin@fosselat.com / admin123');
  process.exit(0);
}

seed().catch((err) => {
  console.error('[Seed Error]:', err);
  process.exit(1);
});
