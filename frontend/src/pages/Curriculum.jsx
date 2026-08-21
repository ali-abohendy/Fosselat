import React, { useState, useEffect } from 'react';
import { BookOpen, Globe, Star, FileText, CheckCircle, Calendar, Clock, Trophy, MapPin, ArrowRight } from 'lucide-react';
import { UNIFIED_CURRICULUM } from './curriculumData';
import './Curriculum.css';
import Button from '../components/Button';

function ProgramCard({ program, trackId, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const [activeLevelIndex, setActiveLevelIndex] = useState(0);

  const level = program.levels[activeLevelIndex];
  const totalWeeks = program.levels.reduce((acc, l) => acc + (l.weeks || 0), 0);
  const totalLessons = program.levels.reduce((acc, l) => acc + (l.lessons || 0), 0);

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
          
          {program.levels.length > 0 && (
            <>
              {/* Level tabs */}
              <div className="cur-level-tabs">
                {program.levels.map((lv, i) => (
                  <button key={lv.id} className={`cur-level-tab ${activeLevelIndex === i ? 'active' : ''}`}
                    onClick={() => setActiveLevelIndex(i)}>
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
              Test your level in {program.label}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Curriculum() {
  const [activeTrack, setActiveTrack] = useState('quran');

  useEffect(() => {
    document.title = 'Unified Academic Curriculum — Fosselat Academy';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="page-enter">
      {/* Hero Section */}
      <section className="page-hero">
        <div className="page-hero-overlay" />
        <div className="container page-hero-content">
          <h1>Our <span className="text-gold">Curriculum</span></h1>
          <p>Unified Student Division &mdash; Quran, Arabic Language, and Islamic Studies</p>
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
            {UNIFIED_CURRICULUM.map(t => (
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
          {UNIFIED_CURRICULUM.filter(t => t.id === activeTrack).map(track => (
            <div key={track.id} className="cur-track-content">
              
              <div className="cur-track-header-soft" style={{ textAlign: 'center', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
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

      {/* Download */}
      <section className="section" style={{ textAlign: 'center', paddingBottom: '80px' }}>
        <a href="/Fosselat_Academy_Curriculum_Framework.pdf" download className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={18} /> Download Full Curriculum PDF (42 Pages)
        </a>
      </section>
    </div>
  );
}
