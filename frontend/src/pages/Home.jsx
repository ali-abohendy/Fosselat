import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import FeatureCard from '../components/FeatureCard';
import QuranVerse from '../components/QuranVerse';

import { Users, BookOpen, Clock, Trophy, FileText, Headphones, Star, Phone, GraduationCap, ClipboardList, DollarSign } from '../components/Icons';
import './Home.css';

const WHATSAPP_NUMBER = '966595796177';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=Assalam%20alikom%20warahmatuallah%20wabarakatu.%20I%20want%20to%20book%20a%20free%20time%20trial,%20please.`;
const WHATSAPP_ENROLL = `https://wa.me/${WHATSAPP_NUMBER}?text=Assalam%20alikom%20warahmatuallah%20wabarakatu,%20I%20would%20like%20to%20enroll%20in%20Fosselat%20Academy.`;

const PLANS = [
  { id: 'starter', name: 'Starter (2/week)' },
  { id: 'growth', name: 'Growth (3/week)' },
  { id: 'excellence', name: 'Excellence (4/week)' },
  { id: 'elite', name: 'Elite (5/week)' },
];
const DURATIONS = [30, 40, 45, 60, 90, 120];

const characteristics = [
  { icon: <GraduationCap size={32} />, title: 'Certified & Ijazah-Certified Teachers', desc: 'Learn from qualified teachers with authenticated chains of transmission.', link: null },
  { icon: <Users size={32} />, title: 'Age-Based Learning Paths', desc: 'Structured curriculum tailored for kids and adults at every level.', link: '/curriculum' },
  { icon: <ClipboardList size={32} />, title: 'Initial Placement Test', desc: 'Find your perfect starting level with our adaptive assessment.', link: '/placement-tests' },
  { icon: <Trophy size={32} />, title: 'Certificates After Every Level', desc: 'Earn official certificates of achievement as you advance.', link: '/curriculum' },
  { icon: <Users size={32} />, title: 'Personal One-on-One Classes', desc: 'Every lesson is private, focused entirely on your learning needs.', link: null },
  { icon: <Clock size={32} />, title: 'Learn at Your Preferred Time', desc: 'Choose the schedule that fits your lifestyle perfectly.', link: null },
  { icon: <Star size={32} />, title: 'Free Trial Before You Enroll', desc: 'Try a complimentary class before making any commitment.', link: WHATSAPP_URL },
  { icon: <Users size={32} />, title: 'Try Another Teacher for Free', desc: 'Not the right fit? Switch teachers at no extra cost.', link: null },
  { icon: <DollarSign size={32} />, title: '30-Day Money-Back Guarantee', desc: 'Full refund within 30 days if you are not satisfied.', link: null },
];



import { blogPosts } from '../data/blogPosts';


export default function Home() {
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollPlan, setEnrollPlan] = useState('');
  const [enrollDuration, setEnrollDuration] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    document.title = 'FOSSELAT — Learn Qur\'an. The Right Way.';
  }, []);

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin': return '/admin/dashboard';
      case 'teacher': return '/teacher/dashboard';
      default: return '/student/dashboard';
    }
  };

  return (
    <div className="page-enter">
      {/* ===== HERO ===== */}
      <section className="hero">
        <img src="/hero-bg.jpg" className="hero-bg-image" aria-hidden="true" alt="" />
        <div className="hero-bg-overlay" aria-hidden="true" />
        <div className="container hero-container">
          <div className="hero-content">
            <h1 className="hero-ayah" dir="rtl" lang="ar">
              كِتَابٌ فُصِّلَتْ آيَاتُهُ قُرْآنًا عَرَبِيًّا لِّقَوْمٍ يَعْلَمُونَ
            </h1>
            <p className="hero-subtitle">
              Inspiring Faith through Qur'an, Arabic, and Islamic Studies
            </p>
            <div className="hero-buttons">
              {user ? (
                <Button to={getDashboardLink()} variant="primary" size="lg">
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Button href={WHATSAPP_URL} variant="outline" size="lg">
                    <Phone size={18} style={{ marginRight: '8px' }} /> Book a Free Trial
                  </Button>
                  <Button as="button" onClick={() => setShowEnrollModal(true)} variant="primary" size="lg">
                    Enroll Now
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="section features-section">
        <div className="container">
          <div className="section-title">
            <h2>Why Choose <span className="text-gold">FOSSELAT</span>?</h2>
            <div className="gold-line" />
            <p>We provide the best Qur'an learning experience with modern tools and traditional values.</p>
          </div>
          <div className="features-grid elegant-features">
            {characteristics.map((c, i) => {
              const cardContent = (
                <>
                  <div className="elegant-feature-icon">{c.icon}</div>
                  <div className="elegant-feature-text">
                    <h3>{c.title}</h3>
                    <p>{c.desc}</p>
                  </div>
                </>
              );
              return c.link ? (
                c.link.startsWith('http') ? (
                  <a href={c.link} key={i} className="elegant-feature-card link-card" target="_blank" rel="noopener noreferrer">
                    {cardContent}
                  </a>
                ) : (
                  <Link to={c.link} key={i} className="elegant-feature-card link-card">
                    {cardContent}
                  </Link>
                )
              ) : (
                <div key={i} className="elegant-feature-card">
                  {cardContent}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== QURAN VERSE ===== */}
      <QuranVerse />

      {/* ===== PLACEMENT TESTS ===== */}
      <section className="section placement-teaser" style={{ background: 'var(--color-bg-secondary)' }}>
        <div className="container">
          <div className="section-title">
            <h2>Test Your <span className="text-gold">Level</span></h2>
            <div className="gold-line" />
            <p>Not sure where to start? Take a placement test for the right program.</p>
          </div>
          <div className="features-grid">
            <div className="feature-card" style={{textAlign: 'center'}}>
              <div className="feature-icon"><BookOpen size={32} /></div>
              <h3>Quran Track</h3>
              <Button to="/placement-tests?track=quran" variant="outline" style={{marginTop:'12px'}}>Take Test</Button>
            </div>
            <div className="feature-card" style={{textAlign: 'center'}}>
              <div className="feature-icon"><Headphones size={32} /></div>
              <h3>Arabic Track</h3>
              <Button to="/placement-tests?track=arabic" variant="outline" style={{marginTop:'12px'}}>Take Test</Button>
            </div>
            <div className="feature-card" style={{textAlign: 'center'}}>
              <div className="feature-icon"><Star size={32} /></div>
              <h3>Islamic Studies</h3>
              <Button to="/placement-tests?track=islamic-studies" variant="outline" style={{marginTop:'12px'}}>Take Test</Button>
            </div>
          </div>
        </div>
      </section>



      {/* ===== BLOG ===== */}
      <section className="section blog-section">
        <div className="container">
          <div className="section-title">
            <h2>Latest <span className="text-gold">Articles</span></h2>
            <div className="gold-line" />
            <p>Insights on Qur'an, Arabic, and Islamic Studies</p>
          </div>
          <div className="blog-grid">
            {blogPosts.slice(0, 3).map((post) => (
              <article className="blog-card" key={post.id}>
                <div className="blog-card-category">{post.category}</div>
                <h3 className="blog-card-title">{post.title}</h3>
                <p className="blog-card-excerpt">{post.excerpt}</p>
                <div className="blog-card-footer">
                  <span className="blog-card-date">{post.date}</span>
                  <Link to={`/blog/${post.slug}`} className="blog-card-link">Read More →</Link>
                </div>
              </article>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Button to="/blog" variant="outline">View All Articles</Button>
          </div>
        </div>
      </section>

      {/* ===== ENROLL MODAL ===== */}
      {showEnrollModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)'
        }} onClick={() => setShowEnrollModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'var(--color-bg-alt)',
            border: '1px solid var(--color-border)',
            padding: 'clamp(15px, 5vw, 30px)',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '90%',
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <button style={{
              position: 'absolute', top: '15px', right: '15px',
              background: 'none', border: 'none', color: 'var(--color-text-muted)',
              fontSize: '20px', cursor: 'pointer'
            }} onClick={() => setShowEnrollModal(false)}>✕</button>
            <h2 style={{ marginBottom: '20px', color: 'var(--color-gold)' }}>Enroll in Fosselat Academy</h2>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Select Plan</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {PLANS.map(p => (
                  <div key={p.id}
                    onClick={() => setEnrollPlan(p)}
                    style={{
                      padding: '12px', border: `1px solid ${enrollPlan?.id === p.id ? 'var(--color-gold)' : 'var(--color-border)'}`,
                      borderRadius: '8px', cursor: 'pointer', textAlign: 'center',
                      background: enrollPlan?.id === p.id ? 'rgba(200,167,99,0.1)' : 'transparent',
                      color: enrollPlan?.id === p.id ? 'var(--color-gold)' : 'inherit'
                    }}>
                    {p.name}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Select Duration</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {DURATIONS.map(d => (
                  <div key={d}
                    onClick={() => setEnrollDuration(d)}
                    style={{
                      padding: '8px 16px', border: `1px solid ${enrollDuration === d ? 'var(--color-gold)' : 'var(--color-border)'}`,
                      borderRadius: '20px', cursor: 'pointer',
                      background: enrollDuration === d ? 'rgba(200,167,99,0.1)' : 'transparent',
                      color: enrollDuration === d ? 'var(--color-gold)' : 'inherit'
                    }}>
                    {d} min
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-actions">
              <a 
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Assalam alikom warahmatuallah wabarakatu, I would like to enroll in Fosselat Academy. Plan: ${enrollPlan?.name}, Duration: ${enrollDuration} min`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`button button-primary button-lg ${(!enrollPlan || !enrollDuration) ? 'disabled' : ''}`}
                style={{ width: '100%', textAlign: 'center', display: 'block', textDecoration: 'none' }}
              >
                Send Request via WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
