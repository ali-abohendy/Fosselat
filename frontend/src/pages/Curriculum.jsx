import React, { useState, useEffect } from 'react';
import { BookOpen, Globe, Star, FileText, CheckCircle, Calendar, Sparkles } from 'lucide-react';
import { UNIFIED_CURRICULUM } from './curriculumData';
import './Curriculum.css';
import Button from '../components/Button';
import CurriculumDownloadModal from '../components/CurriculumDownloadModal';

// Plain-English beginner-friendly summaries so new learners aren't intimidated by technical Tajweed terms
const PLAIN_ENGLISH_SUMMARIES = {
  'reading-tajweed-1':
    'Built for complete beginners starting from zero — following the proven Noorani Qaida & Noor Al-Bayan method. No prior Arabic knowledge needed. You will learn every Arabic letter, how letters connect, and how to sound out your very first real Qur’anic words step by step.',
  'reading-tajweed-2':
    'Move from single words to reading complete short verses smoothly. You will master natural stretched vowels (long sounds) and reading marks in the Mushaf so your recitation flows with steady rhythm.',
  'reading-tajweed-3':
    'Learn how to connect verses seamlessly and stop gracefully at the right places, while applying core everyday Tajweed rules naturally as you read — explained in simple English.',
  'reading-tajweed-4':
    'Polish your recitation to confident, independent fluency — refining pronunciation accuracy, timing, and graceful pauses so you can open any page of the Mushaf and recite beautifully.',
};

function ProgramCard({ program, trackId, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const [activeLevelIndex, setActiveLevelIndex] = useState(0);

  const level = program.levels[activeLevelIndex];
  const totalWeeks = program.levels.reduce((acc, l) => acc + (l.weeks || 0), 0);
  const totalLessons = program.levels.reduce((acc, l) => acc + (l.lessons || 0), 0);
  const plainSummary = level ? PLAIN_ENGLISH_SUMMARIES[`${program.id}-${level.id}`] : null;

  return (
    <div className={`cur-program ${open ? 'open' : ''}`}>
      <button className="cur-program-header" onClick={() => setOpen(!open)}>
        <div>
          <h3>{program.label}</h3>
          <p className="cur-program-meta">
            {program.levels.length} Levels &middot; {totalWeeks > 0 ? `~${totalWeeks} weeks` : 'Flexible duration'} &middot; {totalLessons > 0 ? `${totalLessons} lessons` : 'Continuous'}
          </p>
        </div>
        <span className="cur-toggle">{open ? '-' : '+'}</span>
      </button>

      {open && (
        <div className="cur-program-body">
          <p className="cur-program-desc">{program.description}</p>

          {program.id === 'reading-tajweed' && (
            <div style={{
              background: 'rgba(200, 167, 99, 0.1)',
              border: '1px solid rgba(200, 167, 99, 0.35)',
              borderRadius: '10px',
              padding: '14px 18px',
              marginBottom: '20px',
              color: 'var(--color-cream)',
              fontSize: '0.94rem',
              lineHeight: '1.6',
            }}>
              <strong style={{ color: 'var(--color-gold-light)' }}>Starting from Zero (Noorani Qaida Foundation):</strong>{' '}
              Level 1 is designed specifically for adults and children who do not read Arabic yet. You do not need to know any Arabic letters or technical Tajweed terms before starting — our teachers guide you in clear English from day one.
            </div>
          )}

          {program.levels.length > 0 && (
            <>
              {/* Level tabs */}
              <div className="cur-level-tabs">
                {program.levels.map((lv, i) => (
                  <button
                    key={lv.id}
                    className={`cur-level-tab ${activeLevelIndex === i ? 'active' : ''}`}
                    onClick={() => setActiveLevelIndex(i)}
                  >
                    Level {lv.id}
                  </button>
                ))}
              </div>

              {/* Level detail */}
              {level && (
                <div className="cur-level-detail">
                  <h4>{level.name}</h4>

                  <div className="cur-level-stats">
                    {level.weeks > 0 && <span><Calendar size={16} /> {level.weeks} weeks</span>}
                    {level.lessons > 0 && <span><BookOpen size={16} /> {level.lessons} lessons</span>}
                  </div>

                  {/* Plain-English summary card */}
                  <div style={{
                    background: 'rgba(15, 61, 70, 0.45)',
                    border: '1px solid rgba(200, 167, 99, 0.25)',
                    borderRadius: '10px',
                    padding: '16px 18px',
                    marginBottom: '20px',
                  }}>
                    <h5 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-gold-light)', marginBottom: '6px', fontSize: '0.95rem' }}>
                      <Sparkles size={16} /> In Simple Terms — What You&apos;ll Achieve
                    </h5>
                    <p style={{ color: 'var(--color-cream)', margin: 0, fontSize: '0.94rem', lineHeight: '1.65' }}>
                      {plainSummary || level.desc}
                    </p>
                  </div>

                  <div className="cur-level-grid" style={{ gridTemplateColumns: '1fr', gap: '16px' }}>
                    <div className="cur-level-section">
                      <h5 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><BookOpen size={18} style={{ color: 'var(--color-gold)' }} /> Focus Area</h5>
                      <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.6' }}>{level.desc}</p>
                    </div>

                    {level.outcomes && level.outcomes.length > 0 && (
                      <div className="cur-level-section">
                        <h5 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={18} style={{ color: 'var(--color-gold)' }} /> Learning Outcomes</h5>
                        <ul style={{ listStyleType: 'disc', paddingLeft: '20px', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
                          {level.outcomes.map((item, idx) => (
                            <li key={idx} style={{ marginBottom: '8px' }}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {level.skills && level.skills.length > 0 && (
                      <div className="cur-level-section">
                        <h5 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Star size={18} style={{ color: 'var(--color-gold)' }} /> Gained Skills / Competencies</h5>
                        <ul style={{ listStyleType: 'disc', paddingLeft: '20px', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
                          {level.skills.map((item, idx) => (
                            <li key={idx} style={{ marginBottom: '8px' }}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {level.content && level.content.length > 0 && (
                      <div className="cur-level-section">
                        <h5 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FileText size={18} style={{ color: 'var(--color-gold)' }} /> Main Curriculum Content</h5>
                        <ul style={{ listStyleType: 'disc', paddingLeft: '20px', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
                          {level.content.map((item, idx) => (
                            <li key={idx} style={{ marginBottom: '8px' }}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          <div style={{ padding: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', justifyContent: 'center' }}>
            <Button
              to={`/placement-tests?track=${trackId}&program=${program.id}`}
              variant="outline"
              style={{ whiteSpace: 'normal', height: 'auto', padding: '12px 24px', textAlign: 'center', lineHeight: '1.4' }}
            >
              Take Free Level Test for {program.label}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Curriculum() {
  const [activeTrack, setActiveTrack] = useState('quran');
  const [showLeadModal, setShowLeadModal] = useState(false);

  useEffect(() => {
    document.title = 'Curriculum & Noorani Qaida Roadmap — Fosselat Academy';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="page-enter">
      {/* Hero Section */}
      <section className="page-hero">
        <div className="page-hero-overlay" />
        <div className="container page-hero-content">
          <h1>Our <span className="text-gold">Curriculum</span></h1>
          <p>Step-by-step pathways from complete beginner (Noorani Qaida) to fluent Qur&apos;an recitation, Arabic, and Islamic Studies — taught in clear English.</p>
        </div>
      </section>

      {/* Track Tabs */}
      <section className="section cur-tracks-section" style={{ paddingTop: '60px' }}>
        <div className="container">
          <div className="section-title">
            <h2>Explore <span className="text-gold">Learning Tracks</span></h2>
            <div className="gold-line" />
          </div>

          <div className="cur-track-tabs">
            {UNIFIED_CURRICULUM.map((t) => (
              <button
                key={t.id}
                className={`cur-track-tab ${activeTrack === t.id ? 'active' : ''}`}
                onClick={() => setActiveTrack(t.id)}
              >
                {t.id === 'quran' ? <BookOpen size={18} /> : t.id === 'arabic' ? <Globe size={18} /> : <Star size={18} />}
                {t.label} Track
              </button>
            ))}
          </div>

          {/* Render active track */}
          {UNIFIED_CURRICULUM.filter((t) => t.id === activeTrack).map((track) => (
            <div key={track.id} className="cur-track-content">
              <div className="cur-track-header-soft" style={{ textAlign: 'center', marginBottom: '40px', maxWidth: '640px', margin: '0 auto 40px' }}>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', lineHeight: '1.6', fontStyle: 'italic' }}>
                  {track.tagline}
                </p>
              </div>

              {track.programs.map((prog, index) => (
                <ProgramCard
                  key={prog.id}
                  program={prog}
                  trackId={track.id}
                  defaultOpen={index === 0}
                />
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Diamond Divider */}
      <div className="cur-diamond-divider" aria-hidden="true">
        <span className="d-small"></span>
        <span className="d-medium"></span>
        <span className="d-large"></span>
        <span className="d-medium"></span>
        <span className="d-small"></span>
      </div>

      {/* Lead-Captured Free 42-Page Curriculum Gift */}
      <section className="section" style={{ textAlign: 'center', paddingBottom: '80px' }}>
        <div className="container" style={{ maxWidth: '680px' }}>
          <h2 style={{ marginBottom: '12px' }}>Want the Complete <span className="text-gold">42-Page Roadmap</span>?</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px' }}>
            Get our full downloadable PDF syllabus covering every level, milestone, and outcome — free when you share your email or WhatsApp number.
          </p>
          <button
            type="button"
            onClick={() => setShowLeadModal(true)}
            className="btn btn-primary btn-lg"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <FileText size={18} /> Get Free 42-Page Curriculum PDF
          </button>
        </div>
      </section>

      <CurriculumDownloadModal
        isOpen={showLeadModal}
        onClose={() => setShowLeadModal(false)}
        pageSource="Curriculum"
      />
    </div>
  );
}
