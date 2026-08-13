import { useState, useEffect } from 'react';
import TeacherCard from '../components/TeacherCard';
import { teachersAPI, fallbackData } from '../services/api';
import './Teachers.css';

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    document.title = 'Our Teachers — FOSSCLAT Academy';

    async function fetchTeachers() {
      try {
        const data = await teachersAPI.getAll();
        if (data && data.length) {
          setTeachers(data);
        } else {
          setTeachers(fallbackData.teachers);
        }
      } catch {
        setTeachers(fallbackData.teachers);
      }
    }
    fetchTeachers();
  }, []);

  return (
    <div className="page-enter">
      {/* ===== PAGE HERO ===== */}
      <section className="page-hero">
        <div className="page-hero-overlay" />
        <div className="container page-hero-content">
          <h1>Our Certified <span className="text-gold">Teachers</span></h1>
          <p>Meet our qualified and experienced Qur'an teachers who are dedicated to your learning journey.</p>
        </div>
      </section>

      {/* ===== TEACHERS GRID ===== */}
      <section className="section">
        <div className="container">
          <div className="teachers-grid">
            {teachers.map((teacher) => (
              <TeacherCard key={teacher._id} teacher={teacher} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
