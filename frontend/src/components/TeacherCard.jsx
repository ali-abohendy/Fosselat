import { Link } from 'react-router-dom';
import { Award, Globe } from 'lucide-react';
import './TeacherCard.css';

export default function TeacherCard({ teacher }) {
  const avatarSrc = teacher.avatar || teacher.image;

  return (
    <article className="teacher-card">
      {teacher.hasIjazah && (
        <div className="teacher-ijazah-ribbon" title="Certified with an authentic Ijazah">
          <Award size={13} />
          <span>{teacher.ijazahBadge || 'Ijazah Certified'}</span>
        </div>
      )}

      <div className="teacher-card-avatar">
        {avatarSrc ? (
          <img src={avatarSrc} alt={teacher.name} loading="lazy" />
        ) : (
          <span>{teacher.name?.charAt(0) || 'T'}</span>
        )}
      </div>

      <h3>{teacher.name}</h3>
      <p className="teacher-title">{teacher.title}</p>

      <div className="teacher-meta-chips">
        {teacher.languagesShort && (
          <span className="teacher-meta-chip">
            <Globe size={13} /> {teacher.languagesShort}
          </span>
        )}
        {teacher.experienceLabel && (
          <span className="teacher-meta-chip">{teacher.experienceLabel}</span>
        )}
      </div>

      <p className="teacher-bio">{teacher.shortBio || teacher.bio}</p>

      {teacher.specializations && teacher.specializations.length > 0 && (
        <div className="teacher-card-specs">
          {teacher.specializations.slice(0, 3).map((spec, idx) => (
            <span key={idx} className="teacher-spec-pill">{spec}</span>
          ))}
        </div>
      )}

      <Link to={`/teachers/${teacher._id}`} className="teacher-card-link">
        View Full Profile <span>→</span>
      </Link>
    </article>
  );
}
