import { Link } from 'react-router-dom';
import './CourseCard.css';

const courseIcons = {
  'noorani-qaida': '📖',
  'tajweed-rules': '📜',
  'hifz-program': '🕌',
  'quran-recitation': '🎙️',
  'arabic-language': '✍️',
  'islamic-studies': '☪️',
  'default': '📚'
};

export default function CourseCard({ course }) {
  const icon = courseIcons[course.slug] || courseIcons[course.icon] || courseIcons['default'];

  return (
    <div className="course-card">
      <div className="course-card-icon">
        {icon}
      </div>
      <h3>{course.title}</h3>
      <span className="course-level">{course.level || 'All Levels'}</span>
      <p>{course.short_description}</p>
      <Link to={`/courses/${course._id || course.slug}`} className="course-card-link">
        Enroll Now <span className="arrow">→</span>
      </Link>
    </div>
  );
}
