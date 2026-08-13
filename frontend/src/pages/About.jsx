import { useEffect } from 'react';
import StatCounter from '../components/StatCounter';
import Button from '../components/Button';
import { GraduationCap, Users, ClipboardList, FileText, Trophy, Clock, Star, DollarSign } from '../components/Icons';
import './About.css';

export default function About() {
  useEffect(() => {
    document.title = 'About Us — Fosselat Academy';
  }, []);

  const WHATSAPP_NUMBER = '966595796177';
  const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=Hello!%20I%20would%20like%20to%20book%20a%20free%20trial%20lesson.`;

  const values = [
    { icon: <GraduationCap size={24} />, title: 'Certified & Ijazah-Certified Teachers', desc: 'Learn from qualified teachers with authenticated chains of transmission.' },
    { icon: <Users size={24} />, title: 'Age-Based Learning Paths', desc: 'Structured curriculum tailored for kids and adults at every level.' },
    { icon: <ClipboardList size={24} />, title: 'Initial Placement Test', desc: 'Find your perfect starting level with our adaptive assessment.' },
    { icon: <FileText size={24} />, title: 'Placement Test After Every Level', desc: 'Track your progress with assessments at each milestone.' },
    { icon: <Trophy size={24} />, title: 'Certificates After Every Level', desc: 'Earn official certificates of achievement as you advance.' },
    { icon: <Users size={24} />, title: 'Personal One-on-One Classes', desc: 'Every lesson is private, focused entirely on your learning needs.' },
    { icon: <Clock size={24} />, title: 'Learn at Your Preferred Time', desc: 'Choose the schedule that fits your lifestyle perfectly.' },
    { icon: <Star size={24} />, title: 'Free Trial Before You Enroll', desc: 'Try a complimentary class before making any commitment.' },
    { icon: <Users size={24} />, title: 'Try Another Teacher for Free', desc: 'Not the right fit? Switch teachers at no extra cost.' },
    { icon: <DollarSign size={24} />, title: '30-Day Money-Back Guarantee', desc: 'Full refund within 30 days if you are not satisfied.' }
  ];

  return (
    <div className="page-enter">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-overlay" />
        <div className="container about-hero-content">
          <h1>About Fosselat Academy</h1>
          <p>Learn Qur'an. The Right Way.</p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="section about-mission">
        <div className="container about-mission-grid" style={{ gridTemplateColumns: '1fr', textAlign: 'center' }}>
          <div className="about-mission-text animate-fade-in-up">
            <span className="about-label">Our Mission</span>
            <h2>Accessible Online Education</h2>
            <div className="gold-line" style={{ margin: '0 auto 20px auto' }} />
            <p className="mission-statement" style={{ maxWidth: '800px', margin: '0 auto 20px auto' }}>
              At Fosselat Academy, we are committed to making Quran, Arabic, and Islamic Studies accessible to learners of all ages and backgrounds through engaging, personalized online education.
            </p>
            <p style={{ maxWidth: '800px', margin: '0 auto 20px auto' }}>
              Our mission is to provide every student with a structured learning journey led by certified and Ijazah-certified teachers who combine authentic Islamic knowledge with effective teaching methods. Whether you're a beginner or an advanced learner, our age-based curriculum and personalized one-on-one classes ensure that every lesson is tailored to your goals and learning pace.
            </p>
            <p style={{ maxWidth: '800px', margin: '0 auto 20px auto' }}>
              We begin with an initial placement test to determine the right starting level, followed by placement assessments after every level to track your progress. Upon successful completion of each stage, students receive an official certificate of achievement.
            </p>
            <p style={{ maxWidth: '800px', margin: '0 auto 20px auto' }}>
              To make learning as convenient as possible, you can choose the schedule that fits your lifestyle, enjoy a free trial class before enrolling, and even switch to another teacher for free if needed. Your satisfaction is our priority, which is why we also offer a 30-day money-back guarantee.
            </p>
            <p style={{ maxWidth: '800px', margin: '0 auto' }}>
              At Fosselat Academy, we're not just teaching lessons—we're helping students build a lifelong connection with the Quran, the Arabic language, and authentic Islamic knowledge.
            </p>
          </div>
        </div>
      </section>

      {/* Key Features / Values */}
      <section className="section" style={{ background: 'var(--color-bg-light)' }}>
        <div className="container">
          <div className="section-title text-center" style={{ marginBottom: '40px' }}>
            <h2>Why Choose <span className="text-gold">Fosselat</span>?</h2>
            <div className="gold-line" style={{ margin: '0 auto' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {values.map((v, i) => (
              <div key={i} style={{
                background: 'var(--gradient-card)',
                border: '1px solid rgba(200,167,99,0.1)',
                padding: '24px',
                borderRadius: '12px',
                display: 'flex',
                gap: '16px',
                alignItems: 'flex-start'
              }}>
                <div style={{ color: 'var(--color-gold)', background: 'rgba(200,167,99,0.1)', padding: '10px', borderRadius: '50%' }}>
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
      <section className="section" style={{ textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ marginBottom: '20px' }}>Start Your Journey Today</h2>
          <Button href={WHATSAPP_URL} variant="primary" size="lg">
            Book a Free Trial
          </Button>
        </div>
      </section>
    </div>
  );
}
