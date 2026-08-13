import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Calendar } from '../../components/Icons';
import Button from '../../components/Button';

const API = 'http://localhost:5000/api';
const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('fossclat_token')}`,
});

const DAYS_MAP = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function StudentDashboard() {
  const [data, setData] = useState({ scheduled: [], recent_sessions: [] });
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Student Dashboard — Fosselat';
    fetch(`${API}/student/dashboard`, { headers: getHeaders() })
      .then(r => r.json())
      .then(d => { if (d.success) setData(d.data); })
      .catch(() => {});
  }, []);

  const today = DAYS_MAP[new Date().getDay()];

  // ALL today's sessions (not just one)
  const todaySessions = (data.scheduled || []).filter(s => s.day === today && s.active);

  return (
    <>
      <div className="dash-page-header">
        <h2>Student Dashboard</h2>
        <p>Welcome to your learning space</p>
      </div>

      {/* Today's Sessions */}
      {todaySessions.length > 0 ? (
        todaySessions.map(session => (
          <div key={session._id} className="dash-stat-card" style={{ marginBottom: '16px', borderColor: 'rgba(200, 167, 99, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div className="stat-icon" style={{ marginBottom: '8px' }}><Video size={28} /></div>
                <h3 style={{ color: 'var(--color-gold)', marginBottom: '4px' }}>Today's Session</h3>
                <p style={{ color: 'var(--color-cream)' }}>
                  {session.subject} with {session.teacher_name}
                </p>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
                  {session.start_time} • {session.duration}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {session.zoom_link && (
                  <Button variant="outline" onClick={() => window.open(session.zoom_link, '_blank')}>
                    Join via Zoom
                  </Button>
                )}
                {session.google_meet_link && (
                  <Button variant="outline" onClick={() => window.open(session.google_meet_link, '_blank')}>
                    Join via Google Meet
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="dash-stat-card" style={{ marginBottom: '24px' }}>
          <div className="stat-icon" style={{ marginBottom: '8px' }}><Calendar size={28} /></div>
          <h3 style={{ color: 'var(--color-cream)', marginBottom: '4px' }}>No session scheduled for today</h3>
          <p style={{ color: 'var(--color-text-muted)' }}>Check your weekly schedule below</p>
        </div>
      )}

      {/* Weekly Schedule */}
      {data.scheduled?.length > 0 && (
        <div className="dash-table-container" style={{ marginBottom: '24px' }}>
          <div className="dash-table-header"><h3>My Weekly Schedule</h3></div>
          <div style={{overflowX:'auto'}}>
            <table className="dash-table">
              <thead><tr><th>Day</th><th>Time</th><th>Subject</th><th>Teacher</th><th>Duration</th><th>Action</th></tr></thead>
              <tbody>
                {data.scheduled.filter(s => s.active).map(s => (
                  <tr key={s._id} style={s.day === today ? { borderLeft: '3px solid var(--color-gold)' } : {}}>
                    <td style={s.day === today ? { color: 'var(--color-gold)', fontWeight: 700 } : {}}>
                      {s.day} {s.day === today ? '(Today)' : ''}
                    </td>
                    <td>{s.start_time}</td>
                    <td>{s.subject}</td>
                    <td>{s.teacher_name}</td>
                    <td>{s.duration}</td>
                    <td>
                      {s.day === today && (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {s.zoom_link && (
                            <Button onClick={() => window.open(s.zoom_link, '_blank')} variant="outline" size="sm">
                              Zoom
                            </Button>
                          )}
                          {s.google_meet_link && (
                            <Button onClick={() => window.open(s.google_meet_link, '_blank')} variant="outline" size="sm">
                              Meet
                            </Button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Sessions */}
      <div className="dash-table-container">
        <div className="dash-table-header"><h3>Recent Sessions</h3></div>
        <div style={{overflowX:'auto'}}>
          <table className="dash-table">
            <thead><tr><th>Date</th><th>Teacher</th><th>Subject</th><th>Duration</th><th>Status</th><th>Review</th></tr></thead>
            <tbody>
              {data.recent_sessions?.map(s => (
                <tr key={s._id}>
                  <td>{s.date?.split('T')[0]}</td><td>{s.teacher_name}</td><td>{s.subject}</td>
                  <td>{s.duration}</td>
                  <td><span className={`status-badge status-${s.status}`}>{s.status}</span></td>
                  <td>
                    {s.status === 'present' && !s.reviewed && (
                      <Button to={`/student/review/${s._id}`} variant="outline" size="sm">Review</Button>
                    )}
                    {s.reviewed && <span style={{ color: 'var(--color-gold)', fontSize: '14px' }}>✓ Reviewed</span>}
                  </td>
                </tr>
              ))}
              {(!data.recent_sessions || !data.recent_sessions.length) && <tr><td colSpan="6" style={{textAlign:'center',color:'var(--color-text-muted)'}}>No sessions yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
