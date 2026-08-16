import { useState, useEffect } from 'react';
import CourseCard from '../components/CourseCard';
import { coursesAPI, fallbackData } from '../services/api';
import './Courses.css';

export default function Courses() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    document.title = 'Our Courses — Fosselat Academy';

    async function fetchCourses() {
      try {
        const data = await coursesAPI.getAll();
        if (data && data.length) {
          setCourses(data);
        } else {
          setCourses(fallbackData.courses);
        }
      } catch {
        setCourses(fallbackData.courses);
      }
    }
    fetchCourses();
  }, []);

  return (
    <div className="page-enter">
      {/* ===== PAGE HERO ===== */}
      <section className="page-hero">
        <div className="page-hero-overlay" />
        <div className="container page-hero-content">
          <h1>Our <span className="text-gold">Courses</span></h1>
          <p>Explore our comprehensive range of Qur'an and Islamic studies courses designed for every level.</p>
        </div>
      </section>

      {/* ===== COURSES GRID ===== */}
      <section className="section">
        <div className="container">
          <div className="courses-grid">
            {courses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
