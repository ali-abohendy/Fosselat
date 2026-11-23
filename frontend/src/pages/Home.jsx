import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import QuranVerse from '../components/QuranVerse';
import TrustStrip from '../components/TrustStrip';
import HowClassWorks from '../components/HowClassWorks';
import TeacherCard from '../components/TeacherCard';
import IjazahExplainer from '../components/IjazahExplainer';
import ReviewsSection from '../components/ReviewsSection';
import EnrollModal from '../components/EnrollModal';
import { TEACHERS_DATA } from '../data/teachersData';
import { blogPosts } from '../data/blogPosts';
import { buildWhatsAppUrl, trackWhatsAppClick } from '../utils/siteActions';
import { Users, BookOpen, Clock, Trophy, Headphones, Star, Phone, GraduationCap, ClipboardList, DollarSign } from '../components/Icons';
import './Home.css';

const TRIAL_URL = buildWhatsAppUrl({ page: 'Home', intent: 'trial' });

const characteristics = [
  { icon: <GraduationCap size={30} />, title: 'Al-Azhar & Ijazah-Certified Teachers', desc: 'Learn from vetted instructors trained in authentic Qur\'an recitation (Ijazah) and teaching non-Arabic speakers.', link: '/teachers' },
  { icon: <Users size={30} />, title: 'Built for Both Adults & Kids', desc: 'Age-appropriate learning paths — gentle and interactive for children, respectful and structured for busy adults.', link: '/curriculum' },
  { icon: <ClipboardList size={30} />, title: 'Free Initial Placement Test', desc: 'Find your exact starting point in 3–5 minutes with our free adaptive assessment.', link: '/placement-tests' },
  { icon: <Trophy size={30} />, title: 'Official Certificates Every Level', desc: 'Receive progress milestones and official certificates of achievement as you advance.', link: '/curriculum' },
  { icon: <Users size={30} />, title: 'Personal 1-on-1 Live Classes', desc: 'Every lesson is private on Zoom or Google Meet, taught clearly in English at your own pace.', link: null },
  { icon: <Clock size={30} />, title: 'Flexible Global Scheduling', desc: 'Choose class times that fit your local time zone across the US, UK, Canada, Europe, Australia, and the Gulf.', link: null },
  { icon: <Star size={30} />, title: 'Free 30-Minute Trial Class', desc: 'Experience a real 1-on-1 lesson with a teacher before making any payment or commitment.', link: TRIAL_URL },
  { icon: <Users size={30} />, title: 'Switch Teachers Free Anytime', desc: 'Want a different teaching style? Change teachers anytime at zero extra cost.', link: '/teachers' },
  { icon: <DollarSign size={30} />, title: '30-Day Money-Back Guarantee', desc: 'Enroll with complete peace of mind — full refund within 30 days if you are not satisfied.', link: '/refund-policy' },
];

export default function Home() {
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    document.title = "Fosselat Academy — Learn Qur'an, Arabic & Islamic Studies Online";
  }, []);

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin': return '/admin/dashboard';
      case 'teacher': return '/teacher/dashboard';
      default: return '/student/dashboard';
    }
  };

  const featuredTeachers = TEACHERS_DATA.slice(0, 6);

  return (
    <div className="page-enter">
      {/* ===== CLASSIC SERENE HERO (Airy, Uncluttered, Glowing Arch + Living Ayah Meaning) ===== */}
      <section className="hero">
        <div className="container hero-container">
          <div className="hero-content">
            <h1 className="hero-english-headline">
              Learn to Read the <span className="text-gold">Qur&apos;an</span><br />
              Online, Step by Step
            </h1>

            <div className="hero-ayah-bridge">
              <p className="hero-ayah" dir="rtl" lang="ar">
                كِتَابٌ فُصِّلَتْ آيَاتُهُ قُرْآنًا عَرَبِيًّا لِّقَوْمٍ يَعْلَمُونَ
              </p>
              <p className="hero-ayah-meaning">
                Read &amp; understand this verse yourself — <em>&ldquo;A Book whose verses have been detailed.&rdquo;</em>
              </p>
            </div>

            <div className="hero-buttons">
              {user ? (
                <Button to={getDashboardLink()} variant="primary" size="lg">
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Button
                    href={TRIAL_URL}
                    variant="outline"
                    size="lg"
                    onClick={() => trackWhatsAppClick('home_hero_trial')}
                  >
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

      {/* ===== FACTUAL TRUST STRIP ===== */}
      <TrustStrip />

      {/* ===== FEATURES ===== */}
      <section className="section features-section">
        <div className="container">
          <div className="section-title">
            <h2>Why Choose <span className="text-gold">FOSSELAT</span>?</h2>
            <div className="gold-line" />
            <p>Traditional Islamic scholarship paired with clear English instruction and modern 1-on-1 convenience.</p>
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
                  <a
                    href={c.link}
                    key={i}
                    className="elegant-feature-card link-card"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackWhatsAppClick('home_feature_trial')}
                  >
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

      {/* ===== HOW A CLASS WORKS + SAMPLE VIDEO ===== */}
      <HowClassWorks pageSource="Home" />

      {/* ===== FEATURED TEACHERS ===== */}
      <section className="section teachers-preview-section">
        <div className="container">
          <div className="section-title">
            <h2>Meet Our <span className="text-gold">Teachers</span></h2>
            <div className="gold-line" />
            <p>Dedicated educators fluent in English and Arabic — switch teachers anytime for free.</p>
          </div>

          <IjazahExplainer />

          <div className="teachers-grid">
            {featuredTeachers.map((teacher) => (
              <TeacherCard key={teacher._id} teacher={teacher} />
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Button to="/teachers" variant="outline" size="lg">
              Meet All Our Teachers →
            </Button>
          </div>
        </div>
      </section>

      {/* ===== WHAT PARENTS SAY ABOUT US (REVIEWS) ===== */}
      <ReviewsSection altBg={true} />

      {/* ===== QURAN VERSE ===== */}
      <QuranVerse />

      {/* ===== PLACEMENT TESTS ===== */}
      <section className="section placement-teaser" style={{ background: 'var(--color-bg-light)' }}>
        <div className="container">
          <div className="section-title">
            <h2>Test Your <span className="text-gold">Level</span></h2>
            <div className="gold-line" />
            <p>100% Free · Takes 3–5 minutes · No account required. Find your ideal starting point instantly.</p>
          </div>
          <div className="features-grid">
            <div className="feature-card" style={{ textAlign: 'center' }}>
              <div className="feature-icon"><BookOpen size={32} /></div>
              <h3>Qur&apos;an Track</h3>
              <Button to="/placement-tests?track=quran" variant="outline" style={{ marginTop: '12px' }}>Take Free Test</Button>
            </div>
            <div className="feature-card" style={{ textAlign: 'center' }}>
              <div className="feature-icon"><Headphones size={32} /></div>
              <h3>Arabic Track</h3>
              <Button to="/placement-tests?track=arabic" variant="outline" style={{ marginTop: '12px' }}>Take Free Test</Button>
            </div>
            <div className="feature-card" style={{ textAlign: 'center' }}>
              <div className="feature-icon"><Star size={32} /></div>
              <h3>Islamic Studies</h3>
              <Button to="/placement-tests?track=islamic-studies" variant="outline" style={{ marginTop: '12px' }}>Take Free Test</Button>
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
            <p>Insights on Qur&apos;an, Arabic, and Islamic Studies</p>
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

      {/* ===== HIGH-CONTRAST ENROLL MODAL (LIVE PRICE + PAYPAL + WHATSAPP) ===== */}
      <EnrollModal
        isOpen={showEnrollModal}
        onClose={() => setShowEnrollModal(false)}
        pageSource="Home Modal"
      />
    </div>
  );
}
