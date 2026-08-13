"""
Seed script for Fossclat Academy.

Run:  python seed_data.py

Drops existing data in teachers, courses, and users collections,
then inserts 3 teachers and 6 courses (3 popular).
"""

import os
import sys
from datetime import datetime, timezone

from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/fossclat')

client = MongoClient(MONGO_URI)
db = client.get_default_database()


def seed():
    # ------------------------------------------------------------------ #
    #  Clear old data
    # ------------------------------------------------------------------ #
    db.teachers.drop()
    db.courses.drop()
    print("[OK] Cleared teachers and courses collections")

    # ------------------------------------------------------------------ #
    #  Teachers
    # ------------------------------------------------------------------ #
    teachers_data = [
        {
            "name": "Ustadh Ahmed",
            "title": "Tajweed Expert",
            "bio": "Ustadh Ahmed is a certified Tajweed instructor with over 8 years of experience teaching students of all ages. He holds an Ijazah in Hafs an Asim and is passionate about helping students perfect their Qur'anic recitation.",
            "experience_years": 8,
            "image": "/images/teachers/ustadh-ahmed.jpg",
            "specializations": ["Tajweed", "Qur'an Recitation", "Noorani Qaida"],
            "created_at": datetime.now(timezone.utc),
        },
        {
            "name": "Ustadh Omar",
            "title": "Qur'an Recitation Specialist",
            "bio": "Ustadh Omar has dedicated over 10 years to teaching Qur'an recitation. He specialises in helping students develop fluency and proper pronunciation, guiding them from beginner to advanced levels of recitation.",
            "experience_years": 10,
            "image": "/images/teachers/ustadh-omar.jpg",
            "specializations": ["Qur'an Recitation", "Arabic Phonetics", "Maqamat"],
            "created_at": datetime.now(timezone.utc),
        },
        {
            "name": "Ustadh Bilal",
            "title": "Hifz Specialist",
            "bio": "Ustadh Bilal is a Hafiz of the Qur'an with over 6 years of experience in Hifz programmes. He uses proven memorisation techniques and provides personalised study plans to help students achieve their memorisation goals.",
            "experience_years": 6,
            "image": "/images/teachers/ustadh-bilal.jpg",
            "specializations": ["Hifz", "Memorisation Techniques", "Revision Strategies"],
            "created_at": datetime.now(timezone.utc),
        },
    ]

    result = db.teachers.insert_many(teachers_data)
    teacher_ids = result.inserted_ids
    print(f"[OK] Inserted {len(teacher_ids)} teachers")

    ahmed_id = teacher_ids[0]
    omar_id = teacher_ids[1]
    bilal_id = teacher_ids[2]

    # ------------------------------------------------------------------ #
    #  Courses
    # ------------------------------------------------------------------ #
    courses_data = [
        # --- Popular ---
        {
            "title": "Noorani Qaida",
            "slug": "noorani-qaida",
            "description": "Master the fundamentals of Arabic letter recognition and pronunciation with our comprehensive Noorani Qaida course. This foundational programme is designed for absolute beginners and covers all the essential rules needed to start reading the Qur'an. Students will learn to recognise Arabic letters, understand basic pronunciation rules, and begin combining letters into words.",
            "short_description": "Learn the Arabic alphabet and basic pronunciation rules -- the essential first step to reading the Qur'an.",
            "icon": "BookOpen",
            "image": "/images/courses/noorani-qaida.jpg",
            "level": "Beginner",
            "subjects": ["Arabic Alphabet", "Letter Recognition", "Basic Pronunciation", "Joining Letters", "Short Vowels", "Long Vowels"],
            "teacher_id": ahmed_id,
            "is_popular": True,
            "created_at": datetime.now(timezone.utc),
        },
        {
            "title": "Tajweed Rules",
            "slug": "tajweed-rules",
            "description": "Deepen your recitation skills with a thorough study of Tajweed rules. This intermediate-level course covers the science of proper Qur'anic pronunciation, including Noon Sakinah and Tanween rules, Meem Sakinah rules, Madd (elongation), Qalqalah, and more. Students will practise applying these rules to actual Qur'anic verses.",
            "short_description": "Perfect your Qur'anic recitation by mastering the essential rules of Tajweed.",
            "icon": "Award",
            "image": "/images/courses/tajweed-rules.jpg",
            "level": "Intermediate",
            "subjects": ["Noon Sakinah & Tanween", "Meem Sakinah Rules", "Madd Rules", "Qalqalah", "Lam Shamsiyyah & Qamariyyah", "Waqf & Ibtida"],
            "teacher_id": ahmed_id,
            "is_popular": True,
            "created_at": datetime.now(timezone.utc),
        },
        {
            "title": "Hifz Program",
            "slug": "hifz-program",
            "description": "Embark on the rewarding journey of memorising the Holy Qur'an with our structured Hifz programme. This advanced course provides a personalised memorisation plan, daily revision schedules, and regular assessments. Suitable for students who already have a solid foundation in Tajweed and Qur'an reading.",
            "short_description": "A structured programme to help you memorise the Holy Qur'an with expert guidance.",
            "icon": "Star",
            "image": "/images/courses/hifz-program.jpg",
            "level": "Advanced",
            "subjects": ["Memorisation Techniques", "Daily Revision Plan", "Juz-by-Juz Progression", "Revision Strategies", "Assessment & Testing", "Ijazah Preparation"],
            "teacher_id": bilal_id,
            "is_popular": True,
            "created_at": datetime.now(timezone.utc),
        },
        # --- Additional ---
        {
            "title": "Qur'an Recitation",
            "slug": "quran-recitation",
            "description": "Improve your fluency and confidence in reciting the Qur'an. This course focuses on practical recitation skills, helping students read smoothly and accurately. Sessions include guided recitation practice, pronunciation correction, and progressive reading exercises.",
            "short_description": "Build fluency and confidence in reading the Qur'an with guided recitation practice.",
            "icon": "Mic",
            "image": "/images/courses/quran-recitation.jpg",
            "level": "Intermediate",
            "subjects": ["Fluent Reading", "Pronunciation Practice", "Surah Recitation", "Guided Reading Sessions", "Self-Correction Techniques"],
            "teacher_id": omar_id,
            "is_popular": False,
            "created_at": datetime.now(timezone.utc),
        },
        {
            "title": "Arabic Language Basics",
            "slug": "arabic-language-basics",
            "description": "Learn the basics of the Arabic language to better understand the Qur'an. This course introduces essential vocabulary, basic grammar structures, and common Qur'anic phrases. Ideal for students who want to go beyond recitation and start understanding the meanings of what they read.",
            "short_description": "Understand basic Arabic vocabulary and grammar to deepen your connection with the Qur'an.",
            "icon": "Languages",
            "image": "/images/courses/arabic-basics.jpg",
            "level": "Beginner",
            "subjects": ["Arabic Vocabulary", "Basic Grammar", "Common Qur'anic Words", "Sentence Structure", "Verb Conjugation Basics"],
            "teacher_id": omar_id,
            "is_popular": False,
            "created_at": datetime.now(timezone.utc),
        },
        {
            "title": "Islamic Studies",
            "slug": "islamic-studies",
            "description": "Explore the fundamentals of Islam through a well-rounded Islamic Studies curriculum. This course covers the pillars of Islam, stories of the Prophets, basic Fiqh, Seerah of Prophet Muhammad (peace be upon him), and Islamic manners and ethics. Suitable for students of all ages looking to strengthen their Islamic knowledge.",
            "short_description": "Learn the core teachings of Islam including Fiqh, Seerah, and Islamic ethics.",
            "icon": "GraduationCap",
            "image": "/images/courses/islamic-studies.jpg",
            "level": "Beginner",
            "subjects": ["Pillars of Islam", "Stories of the Prophets", "Basic Fiqh", "Seerah", "Islamic Manners", "Dua & Adhkar"],
            "teacher_id": bilal_id,
            "is_popular": False,
            "created_at": datetime.now(timezone.utc),
        },
    ]

    result = db.courses.insert_many(courses_data)
    print(f"[OK] Inserted {len(result.inserted_ids)} courses ({sum(1 for c in courses_data if c['is_popular'])} popular)")

    # ------------------------------------------------------------------ #
    #  Test User Accounts
    # ------------------------------------------------------------------ #
    from werkzeug.security import generate_password_hash
    from bson import ObjectId

    db.users.drop()
    db.sessions.drop()
    db.reviews.drop()
    db.reports.drop()
    db.student_payments.drop()
    db.teacher_payments.drop()
    db.time_slots.drop()
    db.meetings.drop()
    db.scheduled_sessions.drop()

    # Pre-generate IDs so we can reference them
    admin_id = ObjectId()
    teacher_id = ObjectId()
    student_id = ObjectId()

    users_data = [
        {
            "_id": admin_id,
            "full_name": "Admin User",
            "family_name": "Fosselat",
            "email": "admin@fosselat.com",
            "password": generate_password_hash("admin123"),
            "role": "admin",
            "phone": "+201150243896",
            "status": "active",
            "created_at": datetime.now(timezone.utc),
        },
        {
            "_id": teacher_id,
            "full_name": "Ustadh Ahmed",
            "family_name": "Hassan",
            "email": "teacher@fosselat.com",
            "password": generate_password_hash("teacher123"),
            "role": "teacher",
            "phone": "+201234567890",
            "status": "active",
            "hourly_rate": 15,
            "gross_salary": 2400,
            "bonuses": 0,
            "deductions": 0,
            "net_salary": 2400,
            "title": "Tajweed Expert",
            "bio": "Certified Tajweed instructor with 8+ years experience.",
            "specializations": ["Tajweed", "Quran Recitation"],
            "experience_years": 8,
            "created_at": datetime.now(timezone.utc),
        },
        {
            "_id": student_id,
            "full_name": "Ali",
            "family_name": "Hendy",
            "student_id": "HEN001",
            "email": "student@fosselat.com",
            "password": generate_password_hash("student123"),
            "role": "student",
            "phone": "+201111111111",
            "status": "active",
            "subject": "Tajweed",
            "program": "quran",
            "plan": "growth",
            "class_duration": "60",
            "teacher_name": "Ustadh Ahmed",
            "teacher_id": str(teacher_id),
            "hourly_rate": 96,
            "start_date": "2026-01-15",
            "created_at": datetime.now(timezone.utc),
        },
    ]

    db.users.insert_many(users_data)
    print(f"[OK] Inserted {len(users_data)} test users")

    # ------------------------------------------------------------------ #
    #  Teacher Time Slots + Sample Schedule
    # ------------------------------------------------------------------ #
    time_slots = [
        {"teacher_id": str(teacher_id), "day": "Monday", "start_time": "09:00", "end_time": "12:00"},
        {"teacher_id": str(teacher_id), "day": "Wednesday", "start_time": "09:00", "end_time": "12:00"},
        {"teacher_id": str(teacher_id), "day": "Friday", "start_time": "14:00", "end_time": "17:00"},
    ]
    db.time_slots.insert_many(time_slots)
    print(f"[OK] Inserted {len(time_slots)} teacher time slots")

    # Create a sample scheduled session for today's day
    import calendar as cal
    today_day = cal.day_name[datetime.now().weekday()]
    room_id = f"fosselat-{ObjectId()}"
    scheduled = {
        "teacher_id": str(teacher_id),
        "teacher_name": "Ustadh Ahmed",
        "student_id": str(student_id),
        "student_name": "Ali",
        "student_family_name": "Hendy",
        "student_family_id": "HEN001",
        "subject": "Tajweed",
        "day": today_day,
        "start_time": "10:00",
        "end_time": "11:00",
        "duration": "60 min",
        "meeting_room_id": room_id,
        "recurring": True,
        "active": True,
        "created_at": datetime.now(timezone.utc),
    }
    db.scheduled_sessions.insert_one(scheduled)
    print(f"[OK] Inserted 1 scheduled session (today: {today_day})")

    print("")
    print("Seed complete!")
    print(f"   Database: {db.name}")
    print(f"   Teachers: {db.teachers.count_documents({})}")
    print(f"   Courses:  {db.courses.count_documents({})}")
    print(f"   Users:    {db.users.count_documents({})}")
    print("")
    print("Test accounts:")
    print("   Admin:   admin@fosselat.com / admin123")
    print("   Teacher: teacher@fosselat.com / teacher123")
    print("   Student: student@fosselat.com / student123")


if __name__ == '__main__':
    seed()

