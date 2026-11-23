import { useEffect } from 'react';
import Button from '../components/Button';
import HowClassWorks from '../components/HowClassWorks';
import IjazahExplainer from '../components/IjazahExplainer';
import { GraduationCap, Users, ClipboardList, FileText, Trophy, Clock, Star, DollarSign } from '../components/Icons';
import { buildWhatsAppUrl, trackWhatsAppClick } from '../utils/siteActions';
import './About.css';

export default function About() {
  useEffect(() => {
    document.title = 'About Us — Fosselat Academy';
  }, []);

  const trialUrl = buildWhatsAppUrl({ page: 'About Us', intent: 'trial' });

  const values = [
    { icon: <GraduationCap size={24} />, title: 'Al-Azhar & Ijazah-Certified Teachers', desc: 'Learn from qualified teachers with authenticated chains of transmission and English teaching fluency.' },
    { icon: <Users size={24} />, title: 'Age-Based Learning Paths', desc: 'Structured curriculum tailored for both adults and kids at every level — from absolute zero to fluent recitation.' },
    { icon: <ClipboardList size={24} />, title: 'Initial Placement Test', desc: 'Find your perfect starting level in 3–5 minutes with our free adaptive assessment.' },
    { icon: <FileText size={24} />, title: 'Assessment After Every Level', desc: 'Track your progress clearly with structured reviews at each milestone.' },
    { icon: <Trophy size={24} />, title: 'Certificates After Every Level', desc: 'Earn official certificates of achievement as you advance.' },
    { icon: <Users size={24} />, title: 'Personal 1-on-1 Live Classes in English', desc: 'Every lesson is private on Zoom or Google Meet, taught clearly in English at your personal pace.' },
    { icon: <Clock size={24} />, title: 'Flexible Global Time Zones', desc: 'Choose class times that fit your local schedule across North America, Europe, UK, Australia, and the Gulf.' },
    { icon: <Star size={24} />, title: 'Free 30-Minute Trial Before Enrolling', desc: 'Try a full complimentary 1-on-1 class before making any commitment.' },
    { icon: <Users size={24} />, title: 'Switch Teachers Free Anytime', desc: 'Not the right fit? Switch to another teacher at zero extra cost.' },
    { icon: <DollarSign size={24} />, title: '30-Day Money-Back Guarantee', desc: 'Full refund within 30 days if you are not satisfied with your experience.' },
  ];

  return (
    <div className="page-enter">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-overlay" />
        <div className="container about-hero-content">
          <h1>About Fosselat Academy</h1>
          <p>Structured 1-on-1 Qur&apos;an, Arabic &amp; Islamic Studies — Taught in Clear English for Adults &amp; Kids</p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="section about-mission">
        <div className="container about-mission-grid" style={{ gridTemplateColumns: '1fr', textAlign: 'center' }}>
          <div className="about-mission-text animate-fade-in-up">
            <span className="about-label">Our Mission</span>
            <h2>Accessible, Authentic Online Education</h2>
            <div className="gold-line" style={{ margin: '0 auto 20px auto' }} />
            <p className="mission-statement" style={{ maxWidth: '820px', margin: '0 auto 20px auto' }}>
              At Fosselat Academy, we are committed to making Qur&apos;an, Arabic, and Islamic Studies accessible to non-Arabic-speaking learners of all ages through engaging, 1-on-1 online lessons delivered in clear English.
            </p>
            <p style={{ maxWidth: '820px', margin: '0 auto 20px auto' }}>
              Our mission is to provide every student with a structured learning journey led by Al-Azhar graduates and Ijazah-certified teachers who combine authentic Islamic scholarship with modern, patient teaching methods. Whether you are an adult starting from the very first Arabic letter or a parent seeking an encouraging teacher for your child, every lesson is tailored to your goals and pace.
            </p>
            <p style={{ maxWidth: '820px', margin: '0 auto 20px auto' }}>
              We begin with a free 30-minute trial class and a quick placement assessment to pinpoint your ideal level. Classes are scheduled flexibly across all international time zones, and upon completing each stage you receive an official certificate of achievement.
            </p>
            <p style={{ maxWidth: '820px', margin: '0 auto 30px auto' }}>
              Your peace of mind matters to us: you can switch teachers anytime for free, and every enrollment is protected by our transparent 30-day money-back guarantee.
            </p>

            <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'left' }}>
              <IjazahExplainer />
            </div>
          </div>
        </div>
      </section>

      {/* How a Class Works + Sample Video */}
      <HowClassWorks pageSource="About Us" />

      {/* Key Features / Values */}
      <section className="section">
        <div className="container">
          <div className="section-title text-center" style={{ marginBottom: '40px' }}>
            <h2>Why Choose <span className="text-gold">Fosselat</span>?</h2>
            <div className="gold-line" style={{ margin: '0 auto' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {values.map((v, i) => (
              <div key={i} style={{
                background: 'var(--gradient-card)',
                border: '1px solid rgba(200,167,99,0.14)',
                padding: '24px',
                borderRadius: '12px',
                display: 'flex',
                gap: '16px',
                alignItems: 'flex-start',
              }}>
                <div style={{ color: 'var(--color-gold)', background: 'rgba(200,167,99,0.1)', padding: '10px', borderRadius: '50%', flexShrink: 0 }}>
                  {v.icon}
                </div>
                <div>
                  <h4 style={{ color: 'var(--color-white)', marginBottom: '8px' }}>{v.title}</h4>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: 0 }}>{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section" style={{ textAlign: 'center', background: 'var(--color-bg-light)' }}>
        <div className="container">
          <h2 style={{ marginBottom: '12px' }}>Start Your Journey Today</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '26px' }}>
            Meet our qualified teachers or book your free 30-minute trial class right now.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              href={trialUrl}
              variant="primary"
              size="lg"
              onClick={() => trackWhatsAppClick('about_cta_trial')}
            >
              Book a Free Trial
            </Button>
            <Button to="/teachers" variant="outline" size="lg">
              Meet Our Teachers
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
