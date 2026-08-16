import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import CourseCard from '../components/CourseCard';
import { teachersAPI, fallbackData } from '../services/api';
import './TeacherProfile.css';

export default function TeacherProfile() {
  const { id } = useParams();
  const [teacher, setTeacher] = useState(null);
  const [relatedCourses, setRelatedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      // Fetch teacher
      let teacherData = null;
      try {
        teacherData = await teachersAPI.getById(id);
      } catch {
        teacherData = null;
      }
      if (!teacherData) {
        teacherData = fallbackData.teachers.find((t) => t._id === id);
      }
      setTeacher(teacherData);

      // Find related courses
      if (teacherData) {
        const courses = fallbackData.courses.filter(
          (c) => c.teacher_id === teacherData._id
        );
        setRelatedCourses(courses);
      }

      setLoading(false);
    }

    fetchData();
  }, [id]);

  useEffect(() => {
    if (teacher) {
      document.title = `${teacher.name} — Fosselat Academy`;
    }
  }, [teacher]);

  if (loading) {
    return (
      <div className="page-enter">
        <div className="teacher-profile-loading">
          <div className="loading-spinner" />
          <p>Loading profile…</p>
        </div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="page-enter">
        <div className="teacher-profile-not-found">
          <h2>Teacher Not Found</h2>
          <p>The teacher profile you're looking for doesn't exist.</p>
          <Link to="/teachers" className="btn btn-primary">Browse Teachers</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter">
      {/* ===== PROFILE SECTION ===== */}
      <section className="teacher-profile-hero">
        <div className="page-hero-overlay" />
        <div className="container">
          <nav className="breadcrumb">
            <Link to="/">Home</Link>
            <span className="breadcrumb-sep">/</span>
            <Link to="/teachers">Teachers</Link>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">{teacher.name}</span>
          </nav>

          <div className="teacher-profile-layout">
            {/* Left — Avatar & basic info */}
            <div className="teacher-profile-left">
              <div className="teacher-profile-avatar">
                {teacher.image ? (
                  <img src={teacher.image} alt={teacher.name} />
                ) : (
                  '👤'
                )}
              </div>
              <h1>{teacher.name}</h1>
              <p className="teacher-profile-title">{teacher.title}</p>
              {teacher.experience_years && (
                <span className="teacher-experience-badge">
                  {teacher.experience_years}+ Years Experience
                </span>
              )}
            </div>

            {/* Right — Bio & specializations */}
            <div className="teacher-profile-right">
              <div className="teacher-profile-card">
                <h3>About</h3>
                <p className="teacher-profile-bio">{teacher.bio}</p>
              </div>

              {teacher.specializations && teacher.specializations.length > 0 && (
                <div className="teacher-profile-card">
                  <h3>Specializations</h3>
                  <div className="teacher-specializations">
                    {teacher.specializations.map((spec, index) => (
                      <span key={index} className="specialization-tag">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===== RELATED COURSES ===== */}
      {relatedCourses.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-title">
              <h2>Courses by <span className="text-gold">{teacher.name}</span></h2>
              <div className="gold-line" />
            </div>
            <div className="courses-grid">
              {relatedCourses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
