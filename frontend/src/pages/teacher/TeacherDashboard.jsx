import { useState, useEffect } from 'react';
import { Video, Calendar, ClipboardList, Clock, Wallet, Star, XCircle } from '../../components/Icons';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import API from '../../config';
const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('fossclat_token')}`,
});

const DAYS_MAP = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function TeacherDashboard() {
  const getMonths = () => {
    const months = [];
    const d = new Date();
    for (let i = 0; i < 12; i++) {
      months.push(new Date(d.getFullYear(), d.getMonth() - i, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
    }
    return months;
  };
  const monthOptions = getMonths();
  const [period, setPeriod] = useState(monthOptions[0]);
  const [stats, setStats] = useState({ lessons: 0, time_hours: 0, time_minutes: 0, rate_hour: 0, payroll: 0, bonuses: 0, deductions: 0 });
  const [scheduled, setScheduled] = useState([]);
  const [pastSessions, setPastSessions] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    document.title = 'Teacher Dashboard — Fosselat';
    fetch(`${API}/teacher/dashboard?period=${period}`, { headers: getHeaders() })
      .then(r => r.json())
      .then(d => { if (d.success) setStats(d.data); })
      .catch(() => {});
  }, [period]);

  useEffect(() => {
    fetch(`${API}/teacher/calendar`, { headers: getHeaders() })
      .then(r => r.json())
      .then(d => { 
        if (d.success) {
          setScheduled(d.data?.scheduled || []); 
          setPastSessions(d.data?.past_sessions || []);
        } 
      })
      .catch(() => {});
  }, []);

  const today = DAYS_MAP[new Date().getDay()];
  const todayStr = new Date().toISOString().split('T')[0];
  
  const todaySessions = scheduled.filter(s => {
    if (s.day !== today || !s.active) return false;
    const hasRecorded = pastSessions.some(ps => ps.student_id === s.student_id && ps.date === todayStr);
    return !hasRecorded;
  });

  const netPayroll = Math.round((stats.payroll || 0) + (stats.bonuses || 0) - (stats.deductions || 0));

  return (
    <>
      <div className="dash-page-header">
        <h2>Teacher Dashboard</h2>
        <p>Your teaching overview</p>
      </div>

      {/* Today's Sessions */}
      {todaySessions.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ color: 'var(--color-gold)', marginBottom: '12px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Video size={20} /> Today's Sessions ({todaySessions.length})
          </h3>
          {todaySessions.map(session => (
            <div key={session._id} className="dash-stat-card" style={{ marginBottom: '12px', borderColor: 'rgba(200, 167, 99, 0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h4 style={{ color: 'var(--color-cream)', marginBottom: '4px' }}>
                    {session.student_name}
                    {session.student_family_id && (
                      <span style={{ color: 'var(--color-gold)', fontSize: '13px', marginLeft: '8px' }}>
                        [{session.student_family_id}]
                      </span>
                    )}
                  </h4>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
                    {session.subject} • {session.start_time} • {session.duration}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {session.zoom_link && (
                    <button
                      onClick={() => window.open(session.zoom_link, '_blank')}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        background: 'linear-gradient(135deg, var(--color-gold), var(--color-gold-dark))',
                        color: '#0a1a28', border: 'none', borderRadius: '50px',
                        padding: '10px 20px', fontWeight: 700, fontSize: '14px',
                        cursor: 'pointer', letterSpacing: '0.3px'
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="64" height="64" rx="12" fill="#2D8CFF"/>
                        <path d="M10 22a4 4 0 014-4h24a4 4 0 014 4v20a4 4 0 01-4 4H14a4 4 0 01-4-4V22z" fill="white"/>
                        <path d="M42 28l12-8v24l-12-8V28z" fill="white"/>
                      </svg>
                      Join via Zoom
                    </button>
                  )}
                  {session.google_meet_link && (
                    <button
                      onClick={() => window.open(session.google_meet_link, '_blank')}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        background: 'linear-gradient(135deg, var(--color-gold), var(--color-gold-dark))',
                        color: '#0a1a28', border: 'none', borderRadius: '50px',
                        padding: '10px 20px', fontWeight: 700, fontSize: '14px',
                        cursor: 'pointer', letterSpacing: '0.3px'
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
                        <path d="M40 32.2v9.6l8 8V24l-8 8.2z" fill="#00832d"/>
                        <path d="M4 41.8V52c0 2.2 1.8 4 4 4h10.2l2-9.6-2-8.4L8 36l-4 5.8z" fill="#0066da"/>
                        <path d="M18.2 4L8 14.2 18.2 24l9.6-2L30 14.2 18.2 4z" fill="#e94235"/>
                        <path d="M18.2 24H8v17.8h10.2V24z" fill="#2684fc"/>
                        <path d="M52 14.8l-12-6.8H18.2v16H40v8.2l12 8V18.8c0-2.2-1.8-4-4-4l4 .2-.2-.2z" fill="#00ac47"/>
                        <path d="M40 24H18.2v17.8H40V24z" fill="#00832d"/>
                        <path d="M52 14.8H40v9.2l12 8V18.8c0-2.2-1.8-4-4-4z" fill="#00ac47"/>
                        <path d="M18.2 41.8H8V52c0 2.2 1.8 4 4 4h6.2v-14.2z" fill="#0066da"/>
                        <path d="M18.2 56H40c2.2 0 4-1.8 4-4v-2.2l-8-8H18.2V56z" fill="#2684fc"/>
                      </svg>
                      Join via Google Meet
                    </button>
                  )}
                  {!session.zoom_link && !session.google_meet_link && (
                    <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                      No meeting link set — ask admin to add Zoom or Google Meet link
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {todaySessions.length === 0 && (
        <div className="dash-stat-card" style={{ marginBottom: '24px' }}>
          <div className="stat-icon" style={{ marginBottom: '8px' }}><Calendar size={28} /></div>
          <h3 style={{ color: 'var(--color-cream)', marginBottom: '4px' }}>No sessions scheduled for today</h3>
          <p style={{ color: 'var(--color-text-muted)' }}>Check your full calendar for upcoming sessions</p>
        </div>
      )}

      {/* Stats */}
      <div className="dash-table-filters" style={{ marginBottom: '24px' }}>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          style={{ width: '100%', maxWidth: '200px', padding: '8px 12px', background: 'transparent', border: '1px solid rgba(200,167,99,0.3)', color: 'var(--color-cream)', borderRadius: '6px' }}
        >
          {monthOptions.map(m => <option key={m} value={m} style={{ color: '#000' }}>{m}</option>)}
        </select>
      </div>

      <div className="dash-stats-grid">
        <div className="dash-stat-card">
          <div className="stat-icon"><ClipboardList size={28} /></div>
          <div className="stat-value">{stats.lessons}</div>
          <div className="stat-label">Lessons</div>
        </div>
        <div className="dash-stat-card">
          <div className="stat-icon"><Clock size={28} /></div>
          <div className="stat-value">{stats.time_hours}h {stats.time_minutes}m</div>
          <div className="stat-label">Teaching Time</div>
        </div>
        <div className="dash-stat-card">
          <div className="stat-icon"><Wallet size={28} /></div>
          <div className="stat-value">{stats.rate_hour} L.E</div>
          <div className="stat-label">Rate / Hour</div>
        </div>
        <div className="dash-stat-card" style={{ borderColor: 'rgba(200, 167, 99, 0.4)' }}>
          <div className="stat-icon"><Wallet size={28} color="var(--color-gold)" /></div>
          <div className="stat-value" style={{ color: 'var(--color-gold)' }}>{netPayroll} L.E</div>
          <div className="stat-label">Net Payroll</div>
        </div>
        <div className="dash-stat-card">
          <div className="stat-icon"><Star size={28} color="#2F7A5E" /></div>
          <div className="stat-value" style={{ color: '#2F7A5E' }}>{stats.bonuses} L.E</div>
          <div className="stat-label">Bonuses</div>
        </div>
        <div className="dash-stat-card">
          <div className="stat-icon"><XCircle size={28} color="#B0453B" /></div>
          <div className="stat-value" style={{ color: '#B0453B' }}>{stats.deductions} L.E</div>
          <div className="stat-label">Deductions</div>
        </div>
      </div>
    </>
  );
}
