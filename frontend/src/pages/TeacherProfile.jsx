import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Award, Globe, CheckCircle, MessageCircle, ShieldCheck } from 'lucide-react';
import { getTeacherById } from '../data/teachersData';
import IjazahExplainer from '../components/IjazahExplainer';
import { buildWhatsAppUrl, trackWhatsAppClick } from '../utils/siteActions';
import './TeacherProfile.css';

export default function TeacherProfile() {
  const { id } = useParams();
  const teacher = getTeacherById(id);

  useEffect(() => {
    if (teacher) {
      document.title = `${teacher.name} — Fosselat Academy`;
    } else {
      document.title = 'Teacher Profile — Fosselat Academy';
    }
  }, [teacher]);

  if (!teacher) {
    return (
      <div className="page-enter">
        <div className="teacher-profile-not-found">
          <h2>Teacher Not Found</h2>
          <p>The teacher profile you&apos;re looking for doesn&apos;t exist.</p>
          <Link to="/teachers" className="btn btn-primary">Browse All Teachers</Link>
        </div>
      </div>
    );
  }

  const bookUrl = buildWhatsAppUrl({
    page: `Teacher Profile: ${teacher.shortName}`,
    customText: `Assalamu Alaikum. I would like to book a Free Trial class with ${teacher.name} at Fosselat Academy.`,
  });

  return (
    <div className="page-enter">
      <section className="teacher-profile-hero">
        <div className="page-hero-overlay" />
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span className="breadcrumb-sep">/</span>
            <Link to="/teachers">Teachers</Link>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">{teacher.shortName}</span>
          </nav>

          <div className="teacher-profile-layout">
            {/* Left — Avatar, Badges & Trial CTA */}
            <aside className="teacher-profile-left">
              <div className="teacher-profile-avatar">
                <img src={teacher.avatar} alt={teacher.name} />
              </div>

              <h1>{teacher.name}</h1>
              <p className="teacher-profile-title">{teacher.title}</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', marginBottom: '22px' }}>
                {teacher.hasIjazah && (
                  <span className="teacher-experience-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Award size={15} /> {teacher.ijazahBadge}
                  </span>
                )}
                {teacher.experienceLabel && (
                  <span className="teacher-experience-badge">
                    {teacher.experienceLabel}
                  </span>
                )}
                {teacher.languages && (
                  <span
                    className="teacher-experience-badge"
                    style={{ borderColor: 'rgba(200,167,99,0.35)', color: 'var(--color-cream)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Globe size={14} /> {teacher.languages.join(' · ')}
                  </span>
                )}
              </div>

              <a
                href={bookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="pb-whatsapp-btn"
                onClick={() => trackWhatsAppClick('teacher_profile_trial', { teacher_name: teacher.shortName })}
              >
                <MessageCircle size={18} />
                Book a Free Trial with {teacher.shortName.split(' ')[0]}
              </a>
              <p style={{ marginTop: '10px', fontSize: '0.82rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <ShieldCheck size={14} color="var(--color-gold)" /> Free 30-min trial · Switch teachers free anytime
              </p>
            </aside>

            {/* Right — Full Structured Bio */}
            <div className="teacher-profile-right">
              <div className="teacher-profile-card">
                <h3>About the Teacher</h3>
                {teacher.about.map((para, i) => (
                  <p key={i} className="teacher-profile-bio" style={{ marginBottom: i < teacher.about.length - 1 ? '14px' : 0 }}>
                    {para}
                  </p>
                ))}
              </div>

              {teacher.qualifications && teacher.qualifications.length > 0 && (
                <div className="teacher-profile-card">
                  <h3>Qualifications &amp; Certifications</h3>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {teacher.qualifications.map((q, idx) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: 'var(--color-text-body)', lineHeight: 1.65 }}>
                        <CheckCircle size={17} style={{ color: 'var(--color-gold)', marginTop: '4px', flexShrink: 0 }} />
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {teacher.experiencePoints && teacher.experiencePoints.length > 0 && (
                <div className="teacher-profile-card">
                  <h3>Teaching Experience</h3>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {teacher.experiencePoints.map((exp, idx) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: 'var(--color-text-body)', lineHeight: 1.65 }}>
                        <CheckCircle size={17} style={{ color: 'var(--color-gold)', marginTop: '4px', flexShrink: 0 }} />
                        <span>{exp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {teacher.specializations && teacher.specializations.length > 0 && (
                <div className="teacher-profile-card">
                  <h3>Teaching Specialties</h3>
                  <div className="teacher-specializations">
                    {teacher.specializations.map((spec, index) => (
                      <span key={index} className="specialization-tag">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {teacher.approach && teacher.approach.length > 0 && (
                <div className="teacher-profile-card">
                  <h3>Teaching Approach</h3>
                  {teacher.approach.map((para, i) => (
                    <p key={i} className="teacher-profile-bio" style={{ marginBottom: i < teacher.approach.length - 1 ? '14px' : 0 }}>
                      {para}
                    </p>
                  ))}
                </div>
              )}

              {teacher.hasIjazah && <IjazahExplainer />}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
