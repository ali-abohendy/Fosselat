import { useEffect } from 'react';
import TeacherCard from '../components/TeacherCard';
import IjazahExplainer from '../components/IjazahExplainer';
import Button from '../components/Button';
import { TEACHERS_DATA } from '../data/teachersData';
import { buildWhatsAppUrl, trackWhatsAppClick } from '../utils/siteActions';
import './Teachers.css';

export default function Teachers() {
  useEffect(() => {
    document.title = 'Our Teachers — Fosselat Academy';
  }, []);

  const trialUrl = buildWhatsAppUrl({ page: 'Teachers', intent: 'trial' });

  return (
    <div className="page-enter">
      {/* ===== PAGE HERO ===== */}
      <section className="page-hero">
        <div className="page-hero-overlay" />
        <div className="container page-hero-content">
          <h1>Meet Our Qualified <span className="text-gold">Teachers</span></h1>
          <p>
            Learn 1-on-1 in clear English with Al-Azhar graduates, university scholars, and Ijazah-certified Qur&apos;an teachers dedicated to adults and children.
          </p>
        </div>
      </section>

      {/* ===== TEACHERS GRID ===== */}
      <section className="section">
        <div className="container">
          <IjazahExplainer />

          <div className="teachers-grid">
            {TEACHERS_DATA.map((teacher) => (
              <TeacherCard key={teacher._id} teacher={teacher} />
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '56px' }}>
            <h3 style={{ marginBottom: '10px' }}>Not sure which teacher fits you or your child best?</h3>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '22px', maxWidth: '580px', marginInline: 'auto' }}>
              Book a free 30-minute trial class and we will match you with the ideal teacher — plus you can switch teachers anytime for free.
            </p>
            <Button
              href={trialUrl}
              variant="primary"
              size="lg"
              onClick={() => trackWhatsAppClick('teachers_page_trial')}
            >
              Book a Free Trial Class
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
