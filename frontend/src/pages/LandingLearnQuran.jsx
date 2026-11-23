import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageCircle,
  CheckCircle,
  BookOpen,
  Sparkles,
  Award,
  FileText,
  ChevronDown,
  ShieldCheck,
  Globe,
  Clock,
  Phone,
} from 'lucide-react';
import TrustStrip from '../components/TrustStrip';
import HowClassWorks from '../components/HowClassWorks';
import TeacherCard from '../components/TeacherCard';
import IjazahExplainer from '../components/IjazahExplainer';
import PricingBuilder from '../components/PricingBuilder';
import ReviewsSection from '../components/ReviewsSection';
import CurriculumDownloadModal from '../components/CurriculumDownloadModal';
import { TEACHERS_DATA } from '../data/teachersData';
import { WHATSAPP_DISPLAY, buildWhatsAppUrl, trackWhatsAppClick } from '../utils/siteActions';
import './LandingLearnQuran.css';

const PAGE_SOURCE = 'LP-1 Learn Quran From Zero';

const WHO_IS_THIS_FOR = [
  {
    icon: <Sparkles size={26} />,
    title: "I don't know the Arabic letters yet",
    desc: 'Start gently from the very first letter with our structured Noorani Qaida & Noor Al-Bayan foundation. No prior Arabic knowledge is required.',
  },
  {
    icon: <BookOpen size={26} />,
    title: 'I read slowly & lose confidence',
    desc: 'Bridge the gap from sounding out individual letters to reading connected Qur’anic verses smoothly without stumbling or hesitation.',
  },
  {
    icon: <Award size={26} />,
    title: 'I want to learn proper Tajweed',
    desc: 'Learn clear pronunciation and practical Tajweed rules explained in simple English — never overwhelming jargon.',
  },
];

const LEVEL_1_MILESTONES = [
  'Recognize and pronounce all 29 Arabic letters accurately in every connected form.',
  'Master short and long vowels so you can blend letters into real Qur’anic words.',
  'Read directly from the Mushaf using proven Noorani Qaida & Noor Al-Bayan step-by-step drills.',
  'Understand every rule in clear, everyday English at your own comfortable pace.',
];

const FAQS = [
  {
    q: 'What language are the classes taught in?',
    a: 'All lessons and explanations are delivered in clear English by bilingual teachers fluent in both English and Arabic. You do not need to speak or understand Arabic before starting.',
  },
  {
    q: 'Can I really learn to read the Qur’an if I know zero Arabic?',
    a: 'Yes! Level 1 is designed specifically for absolute beginners — adults, new Muslims, and children alike. Using our structured Noorani Qaida foundation, most beginners start reading real Qur’anic words within their first weeks.',
  },
  {
    q: 'What happens during the Free 30-Minute Trial Class?',
    a: 'You meet a certified male or female teacher live on Zoom or Google Meet, share your goals, try an interactive sample lesson, and receive a personalized level recommendation — with zero payment or obligation.',
  },
  {
    q: 'What time zones and schedules are available?',
    a: 'We teach students across the USA, Canada, UK, Europe, Australia, and the Gulf. You choose the exact days and times that match your local time zone.',
  },
  {
    q: 'Do I need a PayPal account to enroll and pay?',
    a: 'No! You can pay securely using either your PayPal account OR directly with any Visa / Mastercard debit or credit card via PayPal guest checkout — no PayPal account required.',
  },
  {
    q: 'How does the 30-Day Money-Back Guarantee work?',
    a: 'If you are not satisfied for any reason within 30 calendar days of your initial payment, simply message us on WhatsApp or email support@fosselatacademy.com and we will issue a full refund. You can also switch teachers anytime for free.',
  },
];

export default function LandingLearnQuran() {
  const [openFaq, setOpenFaq] = useState(0);
  const [showLeadModal, setShowLeadModal] = useState(false);

  useEffect(() => {
    document.title = "Learn to Read the Qur'an from Zero Online (1-on-1 in English) — Fosselat Academy";
  }, []);

  const trialUrl = buildWhatsAppUrl({ page: PAGE_SOURCE, intent: 'trial' });
  const chatUrl = buildWhatsAppUrl({ page: PAGE_SOURCE, intent: 'general' });

  return (
    <div className="lp-page">
      {/* 1. MINIMAL TOP BAR (Logo + WhatsApp + Free Trial CTA — No Distracting Menu) */}
      <header className="lp-topbar">
        <div className="container lp-topbar-inner">
          <Link to="/" className="lp-brand" aria-label="Fosselat Academy">
            <img src="/logo.png" alt="Fosselat Academy" className="lp-brand-logo" />
            <div className="lp-brand-text">
              <span className="lp-brand-name">Fosselat</span>
              <span className="lp-brand-tag">Islamic Qur&apos;an School</span>
            </div>
          </Link>

          <div className="lp-topbar-right">
            <a
              href={chatUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="lp-topbar-phone"
              onClick={() => trackWhatsAppClick('lp1_topbar_number')}
            >
              <Phone size={15} />
              <span>{WHATSAPP_DISPLAY}</span>
            </a>
            <a
              href={trialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary lp-topbar-cta"
              onClick={() => trackWhatsAppClick('lp1_topbar_trial')}
            >
              Book a Free Trial
            </a>
          </div>
        </div>
      </header>

      {/* 2. HERO (Clear English Promise + Free Trial & WhatsApp Buttons + Visual) */}
      <section className="lp-hero">
        <div className="container lp-hero-grid">
          <div className="lp-hero-copy">
            <span className="lp-hero-eyebrow">1-on-1 Live Online · Taught in Clear English</span>
            <h1>
              Learn to Read the <span className="text-gold">Qur&apos;an from Zero</span> — Step by Step
            </h1>
            <p className="lp-hero-sub">
              Private live classes for <strong>adults and kids</strong> with Al-Azhar &amp; Ijazah-certified teachers. Start with a <strong>Free 30-Minute Trial Class</strong> — backed by our <strong>30-Day Money-Back Guarantee</strong>.
            </p>

            <div className="lp-hero-pills">
              <span><Globe size={15} /> No Arabic Required</span>
              <span><Clock size={15} /> Flexible Time Zones</span>
              <span><ShieldCheck size={15} /> 30-Day Refund Guarantee</span>
            </div>

            <div className="lp-hero-ctas">
              <a
                href={trialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-lg"
                onClick={() => trackWhatsAppClick('lp1_hero_trial')}
              >
                Book a Free Trial Class
              </a>
              <a
                href={chatUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="lp-wa-outline-btn"
                onClick={() => trackWhatsAppClick('lp1_hero_whatsapp')}
              >
                <MessageCircle size={19} />
                Chat on WhatsApp
              </a>
            </div>
          </div>

          <div className="lp-hero-visual">
            <div className="hero-visual-arch">
              <div className="hero-visual-header">
                <span className="hero-live-pill">Beginner-Friendly · Noorani Qaida Path</span>
                <h3>From First Arabic Letter to Confident Recitation</h3>
              </div>
              <div className="hero-audiences-grid">
                <div className="hero-audience-card">
                  <span className="hero-aud-tag">Adults &amp; Reverts</span>
                  <h4>Private &amp; Judgment-Free</h4>
                  <p>Learn at your own pace with a patient teacher explaining every step in English.</p>
                </div>
                <div className="hero-audience-card">
                  <span className="hero-aud-tag">Kids (Ages 5+)</span>
                  <h4>Fun &amp; Interactive</h4>
                  <p>Engaging slides, educational games, and encouraging teachers kids look forward to.</p>
                </div>
              </div>
              <div className="hero-teachers-preview">
                <div className="hero-avatar-stack">
                  {TEACHERS_DATA.slice(0, 5).map((t) => (
                    <img key={t._id} src={t.avatar} alt={t.shortName} className="hero-mini-avatar" />
                  ))}
                </div>
                <div className="hero-teachers-preview-text">
                  <strong>Qualified Vetted Teachers</strong>
                  <span>Al-Azhar &amp; Ijazah-Certified Scholars</span>
                </div>
              </div>
              <ul className="hero-visual-checklist">
                <li><CheckCircle size={16} /> Free 30-min trial class before paying anything</li>
                <li><CheckCircle size={16} /> Plans from $32/month via PayPal or Debit/Credit Card</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TRUST STRIP */}
      <TrustStrip />

      {/* 4. WHO IS THIS FOR? (3 Cards + Take Level Test CTA) */}
      <section className="section lp-who-section">
        <div className="container">
          <div className="section-title">
            <h2>Is This Program <span className="text-gold">Right for You</span>?</h2>
            <div className="gold-line" />
            <p>Whether you are starting completely from scratch or refining your reading, you will have a clear step-by-step roadmap.</p>
          </div>

          <div className="lp-who-grid">
            {WHO_IS_THIS_FOR.map((item, idx) => (
              <div className="lp-who-card" key={idx}>
                <div className="lp-who-head">
                  <div className="lp-who-icon">{item.icon}</div>
                  <h3>{item.title}</h3>
                </div>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '34px' }}>
            <Link to="/placement-tests?track=quran" className="btn btn-outline btn-lg">
              Take the Free 3-Min Level Test →
            </Link>
          </div>
        </div>
      </section>

      {/* 5. HOW A CLASS WORKS + SAMPLE VIDEO */}
      <HowClassWorks pageSource={PAGE_SOURCE} />

      {/* 6. WHAT YOU WILL LEARN (Plain-English Level 1 + Curriculum PDF Gift) */}
      <section className="section lp-learn-section">
        <div className="container">
          <div className="lp-learn-card">
            <div className="lp-learn-text">
              <span className="conv-modal-eyebrow">Level 1 · Beginner Foundation (Noorani Qaida)</span>
              <h2>What You Will <span className="text-gold">Learn First</span></h2>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '20px', lineHeight: 1.7 }}>
                No intimidating technical terms — we break Qur&apos;anic reading down into gentle, logical milestones designed for English speakers starting from zero.
              </p>
              <ul className="lp-learn-list">
                {LEVEL_1_MILESTONES.map((point, idx) => (
                  <li key={idx}>
                    <CheckCircle size={18} />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lp-learn-gift">
              <div className="lp-gift-badge">Free 42-Page Syllabus</div>
              <h3>Get the Full Curriculum Guide</h3>
              <p>
                See every level from complete beginner to fluent Tajweed &amp; Hifz in our complete 42-page academic roadmap.
              </p>
              <button
                type="button"
                className="btn btn-primary btn-lg btn-block"
                onClick={() => setShowLeadModal(true)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <FileText size={18} />
                Get the Free Curriculum PDF
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. TEACHERS (6 Cards + Ijazah Explanation + Meet Our Teachers CTA) */}
      <section className="section" style={{ background: 'var(--color-bg-light)' }}>
        <div className="container">
          <div className="section-title">
            <h2>Meet Your <span className="text-gold">Teachers</span></h2>
            <div className="gold-line" />
            <p>Vetted educators fluent in English &amp; Arabic — switch teachers anytime for free.</p>
          </div>

          <IjazahExplainer />

          <div className="teachers-grid">
            {TEACHERS_DATA.slice(0, 6).map((teacher) => (
              <TeacherCard key={teacher._id} teacher={teacher} />
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '36px' }}>
            <Link to="/teachers" className="btn btn-outline btn-lg">
              Meet All Our Teachers →
            </Link>
          </div>
        </div>
      </section>

      {/* 8. PRICING BUILDER + PAYPAL / WHATSAPP + INLINE HOW DO I PAY */}
      <section className="section" id="lp-pricing">
        <div className="container">
          <div className="section-title">
            <h2>Simple Monthly <span className="text-gold">Pricing</span></h2>
            <div className="gold-line" />
            <p>Choose your schedule and class length to see your exact monthly total — pay securely with PayPal or Credit/Debit Card, or chat on WhatsApp first.</p>
          </div>

          <PricingBuilder defaultPlan="growth" defaultDuration={30} pageSource={PAGE_SOURCE} />
        </div>
      </section>

      {/* 9. STUDENT REVIEWS (What Parents Say About Us — No Star Ratings) */}
      <ReviewsSection limit={5} altBg={false} id="lp-reviews" />

      {/* 10. FAQ ACCORDION + WHATSAPP CTA */}
      <section className="section lp-faq-section">
        <div className="container" style={{ maxWidth: '820px' }}>
          <div className="section-title">
            <h2>Frequently Asked <span className="text-gold">Questions</span></h2>
            <div className="gold-line" />
            <p>Everything beginners and parents ask before booking their first class.</p>
          </div>

          <div className="lp-faq-list">
            {FAQS.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className={`lp-faq-item ${isOpen ? 'open' : ''}`}>
                  <button
                    type="button"
                    className="lp-faq-q"
                    onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                    aria-expanded={isOpen}
                  >
                    <span>{item.q}</span>
                    <ChevronDown size={19} className="lp-faq-chevron" />
                  </button>
                  {isOpen && <div className="lp-faq-a">{item.a}</div>}
                </div>
              );
            })}
          </div>

          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <a
              href={chatUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="pb-whatsapp-btn"
              style={{ maxWidth: '340px', margin: '0 auto' }}
              onClick={() => trackWhatsAppClick('lp1_faq_whatsapp')}
            >
              <MessageCircle size={19} />
              Still Have a Question? Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* 11. FINAL CALL TO ACTION + MINIMAL LEGAL FOOTER */}
      <section className="lp-final-cta">
        <div className="container" style={{ maxWidth: '760px', textAlign: 'center' }}>
          <div className="lp-final-guarantee">
            <ShieldCheck size={20} />
            <span>Free 30-Minute Trial · 30-Day Money-Back Guarantee</span>
          </div>
          <h2>Take Your First Step with the <span className="text-gold">Qur&apos;an Today</span></h2>
          <p>
            Book your complimentary 1-on-1 trial class on WhatsApp in 30 seconds — zero commitment, taught clearly in English.
          </p>
          <div className="lp-final-btns">
            <a
              href={trialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-lg"
              onClick={() => trackWhatsAppClick('lp1_final_trial')}
            >
              Book a Free Trial Class
            </a>
            <a href="#lp-pricing" className="btn btn-outline btn-lg">
              View Monthly Plans
            </a>
          </div>
        </div>
      </section>

      <footer className="lp-mini-footer">
        <div className="container lp-mini-footer-inner">
          <span>&copy; {new Date().getFullYear()} Fosselat Academy. All rights reserved.</span>
          <div className="lp-mini-footer-links">
            <Link to="/refund-policy">30-Day Refund Policy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/privacy-policy">Privacy Policy</Link>
          </div>
        </div>
      </footer>

      {/* STICKY MOBILE WHATSAPP BAR (As requested in Audit Page 8) */}
      <div className="lp-mobile-sticky-bar">
        <a
          href={trialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="pb-whatsapp-btn"
          onClick={() => trackWhatsAppClick('lp1_mobile_sticky_whatsapp')}
        >
          <MessageCircle size={19} />
          Book Free Trial on WhatsApp
        </a>
      </div>

      <CurriculumDownloadModal
        isOpen={showLeadModal}
        onClose={() => setShowLeadModal(false)}
        pageSource={PAGE_SOURCE}
      />
    </div>
  );
}
