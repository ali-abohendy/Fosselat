import { Link } from 'react-router-dom';
import './TeacherCard.css';

export default function TeacherCard({ teacher }) {
  return (
    <div className="teacher-card">
      <div className="teacher-card-avatar">
        {teacher.image ? (
          <img src={teacher.image} alt={teacher.name} />
        ) : (
          '👤'
        )}
      </div>
      <h3>{teacher.name}</h3>
      <p className="teacher-title">{teacher.title}</p>
      <p className="teacher-bio">{teacher.bio}</p>
      <Link to={`/teachers/${teacher._id}`} className="teacher-card-link">
        View Profile <span>→</span>
      </Link>
    </div>
  );
}
