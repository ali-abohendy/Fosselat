import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Button from '../components/Button';
import { coursesAPI, teachersAPI, fallbackData } from '../services/api';
import './CourseDetail.css';

export default function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      // Fetch course
      let courseData = null;
      try {
        courseData = await coursesAPI.getById(id);
      } catch {
        courseData = null;
      }
      if (!courseData) {
        courseData = fallbackData.courses.find(
          (c) => c._id === id || c.slug === id
        );
      }
      setCourse(courseData);

      // Fetch teacher
      if (courseData?.teacher_id) {
        let teacherData = null;
        try {
          teacherData = await teachersAPI.getById(courseData.teacher_id);
        } catch {
          teacherData = null;
        }
        if (!teacherData) {
          teacherData = fallbackData.teachers.find(
            (t) => t._id === courseData.teacher_id
          );
        }
        setTeacher(teacherData);
      }

      setLoading(false);
    }

    fetchData();
  }, [id]);

  useEffect(() => {
    if (course) {
      document.title = `${course.title} — Fosselat Academy`;
    }
  }, [course]);

  if (loading) {
    return (
      <div className="page-enter">
        <div className="course-detail-loading">
          <div className="loading-spinner" />
          <p>Loading course…</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="page-enter">
        <div className="course-detail-not-found">
          <h2>Course Not Found</h2>
          <p>The course you're looking for doesn't exist.</p>
          <Button to="/courses" variant="primary">
            Browse Courses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter">
      {/* ===== PAGE HERO ===== */}
      <section className="page-hero">
        <div className="page-hero-overlay" />
        <div className="container page-hero-content">
          <nav className="breadcrumb">
            <Link to="/">Home</Link>
            <span className="breadcrumb-sep">/</span>
            <Link to="/courses">Courses</Link>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">{course.title}</span>
          </nav>
          <h1>{course.title}</h1>
          <span className="course-detail-level">{course.level}</span>
        </div>
      </section>

      {/* ===== COURSE CONTENT ===== */}
      <section className="section">
        <div className="container course-detail-layout">
          {/* Left — Course Info */}
          <div className="course-detail-main">
            <div className="course-detail-card">
              <h2>About This Course</h2>
              <p className="course-detail-description">{course.description}</p>
            </div>

            {course.subjects && course.subjects.length > 0 && (
              <div className="course-detail-card">
                <h2>What You'll Learn</h2>
                <ul className="course-subjects-list">
                  {course.subjects.map((subject, index) => (
                    <li key={index}>
                      <span className="subject-check">✓</span>
                      {subject}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right — Sidebar */}
          <aside className="course-detail-sidebar">
            {teacher && (
              <div className="sidebar-teacher-card">
                <div className="sidebar-teacher-avatar">
                  {teacher.image ? (
                    <img src={teacher.image} alt={teacher.name} />
                  ) : (
                    '👤'
                  )}
                </div>
                <h4>{teacher.name}</h4>
                <p className="sidebar-teacher-title">{teacher.title}</p>
                <Link to={`/teachers/${teacher._id}`} className="sidebar-teacher-link">
                  View Profile →
                </Link>
              </div>
            )}
            <Button to="/enroll" variant="primary" block>
              Enroll Now
            </Button>
          </aside>
        </div>
      </section>
    </div>
  );
}
