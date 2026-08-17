import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Calendar, BookOpen, Clock } from '../../components/Icons';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import API from '../../config';
const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('fossclat_token')}`,
});

const DAYS_MAP = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const PROGRAM_MAP = {
  'Reading & Tajweed': { track: 'quran', program: 'reading-tajweed' },
  'Memorization & Hifz': { track: 'quran', program: 'memorization' },
  'Ijazah Preparation': { track: 'quran', program: 'ijazah' },
  'Arabic Foundation Pathway': { track: 'arabic', program: 'foundation' },
  'Arabic Post-Foundation Pathway': { track: 'arabic', program: 'advanced' },
  'Comprehensive Islamic Studies': { track: 'islamic-studies', program: 'comprehensive' },
  'Aqeedah': { track: 'islamic-studies', program: 'aqeedah' },
  'Fiqh': { track: 'islamic-studies', program: 'fiqh' },
  'Seerah': { track: 'islamic-studies', program: 'seerah' },
  'Hadith': { track: 'islamic-studies', program: 'hadith' },
  'Tafsir': { track: 'islamic-studies', program: 'tafsir' },
  'Manners & Adab': { track: 'islamic-studies', program: 'manners' }
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({ scheduled: [], recent_sessions: [] });
  const navigate = useNavigate();

  const getMonths = () => {
    const months = [];
    const d = new Date();
    for (let i = 0; i < 12; i++) {
      months.push(new Date(d.getFullYear(), d.getMonth() - i, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
    }
    return months;
  };
  const monthOptions = getMonths();
  const getMonthPrefix = (monthStr) => {
    if (!monthStr) return '';
    const d = new Date(monthStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  const [period, setPeriod] = useState(monthOptions[0]);

  useEffect(() => {
    document.title = 'Student Dashboard — Fosselat';
    fetch(`${API}/student/dashboard`, { headers: getHeaders() })
      .then(r => r.json())
      .then(d => { if (d.success) setData(d.data); })
      .catch(() => {});
  }, []);

  const today = DAYS_MAP[new Date().getDay()];
  const todayStr = new Date().toISOString().split('T')[0];
  
  const todaySessions = (data.scheduled || []).filter(s => {
    if (s.day !== today || !s.active) return false;
    const hasRecorded = (data.recent_sessions || []).some(ps => ps.date === todayStr);
    return !hasRecorded;
  });

  const now = new Date();
  const filteredSessions = (data.recent_sessions || []).filter(session => {
    if (!period) return true;
    const sessionDate = new Date(session.date);
    const mStr = getMonthPrefix(period);
    return session.date.startsWith(mStr);
  });

  let sessionsTaken = 0;
  let remainingSessions = 0;
  
  if (period === 'month' && data.cycle) {
    sessionsTaken = data.cycle.sessions_taken || 0;
    remainingSessions = data.cycle.remaining_sessions || 0;
  } else {
    sessionsTaken = filteredSessions.length;
  }

  const weeklyClassesCount = data.scheduled?.length || 0;

  return (
    <>
      <div className="dash-page-header">
        <h2>Student Dashboard</h2>
        <p>Welcome to your learning space</p>
      </div>

      {(() => {
        if (!user || !user.start_date || !user.program) return null;
        const startDate = new Date(user.start_date);
        const now = new Date();
        const daysSinceStart = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
        if (daysSinceStart < 30) return null;

        const programs = user.program.split(',').map(p => p.trim());
        const recommendations = programs.map(p => {
          const mapped = PROGRAM_MAP[p];
          return mapped ? { name: p, ...mapped } : null;
        }).filter(Boolean);

        if (recommendations.length === 0) return null;

        return (
          <div style={{ background: 'rgba(200,167,99,0.1)', border: '1px solid rgba(200,167,99,0.3)', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
            <h3 style={{ color: 'var(--color-gold)', margin: '0 0 8px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={20} /> Monthly Progress Check
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: '14px', color: 'var(--color-cream)' }}>
              You've been studying with us for over a month! We recommend taking these placement tests to track your progress:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {recommendations.map(r => (
                <Button 
                  key={r.program} 
                  variant="primary" 
                  onClick={() => navigate(`/placement-tests?track=${r.track}&program=${r.program}`)}
                >
                  Start {r.name} Test
                </Button>
              ))}
            </div>
          </div>
        );
      })()}

      {period === 'month' && sessionsTaken >= 8 && (
        <div style={{ background: 'rgba(200,167,99,0.1)', border: '1px solid var(--color-gold)', borderRadius: '8px', padding: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ color: 'var(--color-gold)', margin: '0 0 4px', fontSize: '16px' }}>Monthly Progress Check</h3>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-cream)' }}>You have completed {sessionsTaken} sessions this cycle. We recommend taking a quick test to track your progress!</p>
          </div>
          <Button variant="primary" onClick={() => navigate('/placement-tests')}>Take a Test</Button>
        </div>
      )}

      {/* Today's Sessions */}
      <h3 style={{ color: 'var(--color-gold)', marginBottom: '16px', fontSize: '18px' }}>Today's Classes</h3>
      {todaySessions.length > 0 ? (
        todaySessions.map(session => (
          <div key={session._id} className="dash-stat-card" style={{ marginBottom: '16px', borderColor: 'rgba(200, 167, 99, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div className="stat-icon" style={{ marginBottom: '8px' }}><Video size={28} /></div>
                <h3 style={{ color: 'var(--color-gold)', marginBottom: '4px' }}>{session.subject || 'Class'} with {session.teacher_name}</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
                  {session.start_time} • {session.duration}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {session.zoom_link && (
                  <Button variant="primary" onClick={() => window.open(session.zoom_link, '_blank')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Video size={16} /> Join via Zoom
                  </Button>
                )}
                {session.google_meet_link && (
                  <Button variant="primary" onClick={() => window.open(session.google_meet_link, '_blank')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Video size={16} /> Join via Meet
                  </Button>
                )}
                {!session.zoom_link && !session.google_meet_link && (
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>No link provided yet</span>
                )}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="dash-alert dash-alert-info" style={{ background: 'rgba(200,167,99,0.06)', border: '1px solid rgba(200,167,99,0.15)', color: 'var(--color-text-muted)', marginBottom: '32px' }}>
          You have no classes scheduled for today. Check your <a href="/student/calendar" style={{ color: 'var(--color-gold)', textDecoration: 'none' }}>Calendar</a>.
        </div>
      )}

      <div className="dash-table-filters" style={{ marginBottom: '24px' }}>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          style={{ width: '100%', maxWidth: '200px', padding: '8px 12px', background: 'transparent', border: '1px solid rgba(200,167,99,0.3)', color: 'var(--color-cream)', borderRadius: '6px' }}
        >
          {monthOptions.map(m => <option key={m} value={m} style={{ color: '#000' }}>{m}</option>)}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div className="dash-stat-card">
          <div className="stat-icon"><Calendar size={24} /></div>
          <h3>Weekly Classes</h3>
          <p className="stat-number">{weeklyClassesCount}</p>
        </div>
        <div className="dash-stat-card">
          <div className="stat-icon"><Clock size={24} /></div>
          <h3>Sessions Taken</h3>
          <p className="stat-number">{sessionsTaken}</p>
        </div>
        {period === 'month' && (
          <div className="dash-stat-card">
            <div className="stat-icon"><BookOpen size={24} /></div>
            <h3>Remaining Sessions</h3>
            <p className="stat-number">{remainingSessions}</p>
          </div>
        )}
        <div className="dash-stat-card">
          <div className="stat-icon"><BookOpen size={24} /></div>
          <h3>Tests</h3>
          <Button variant="outline" size="sm" onClick={() => navigate('/student/placement-tests')} style={{ marginTop: '12px' }}>
            View Tests
          </Button>
        </div>
      </div>
    </>
  );
}
