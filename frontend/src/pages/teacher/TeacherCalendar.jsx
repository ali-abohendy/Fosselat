import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video } from '../../components/Icons';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';

const API = 'http://localhost:5000/api';
const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('fossclat_token')}`,
});

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function TeacherCalendar() {
  const [scheduled, setScheduled] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Calendar — Teacher';
    fetch(`${API}/teacher/calendar`, { headers: getHeaders() })
      .then(r => r.json())
      .then(d => { if (d.success) setScheduled(d.data); })
      .catch(() => {});
  }, []);

  const grouped = DAYS.reduce((acc, day) => {
    acc[day] = scheduled.filter(s => s.day === day && s.active);
    return acc;
  }, {});

  const hasAny = DAYS.some(day => grouped[day].length > 0);

  const endMeeting = async (session) => {
    try {
      await fetch(`${API}/teacher/session/${session._id}/end`, { method: 'POST', headers: getHeaders() });
      navigate('/teacher/record');
    } catch {}
  };

  return (
    <>
      <div className="dash-page-header">
        <h2>My Teaching Calendar</h2>
        <p>Your weekly scheduled sessions assigned by admin</p>
      </div>

      {!hasAny && (
        <div className="dash-alert dash-alert-info" style={{ background: 'rgba(200,167,99,0.06)', border: '1px solid rgba(200,167,99,0.15)', color: 'var(--color-text-muted)' }}>
          No sessions scheduled yet. Ask the admin to assign students to your available time slots.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
        {DAYS.map(day => (
          grouped[day].length > 0 && (
            <div key={day} style={{ background: 'var(--gradient-card)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(200,167,99,0.1)' }}>
              <h3 style={{ color: 'var(--color-gold)', marginBottom: '12px', fontSize: '16px', borderBottom: '1px solid rgba(200,167,99,0.1)', paddingBottom: '8px' }}>{day}</h3>
              {grouped[day].map(s => (
                <div key={s._id} style={{ background: 'rgba(200,167,99,0.05)', borderRadius: '8px', padding: '12px', marginBottom: '10px', border: '1px solid rgba(200,167,99,0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--color-cream)', fontSize: '14px' }}>{s.student_name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        {s.student_family_id && <span style={{ color: 'var(--color-gold)' }}>[{s.student_family_id}] </span>}
                        {s.subject}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '13px', color: 'var(--color-cream)' }}>
                      <div style={{ fontWeight: 600 }}>{s.start_time}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{s.duration}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                    {s.zoom_link && (
                      <Button variant="outline" size="sm" onClick={() => window.open(s.zoom_link, '_blank')} style={{ flex: 1, fontSize: '12px' }}>
                        Zoom
                      </Button>
                    )}
                    {s.google_meet_link && (
                      <Button variant="outline" size="sm" onClick={() => window.open(s.google_meet_link, '_blank')} style={{ flex: 1, fontSize: '12px' }}>
                        Google Meet
                      </Button>
                    )}
                    <Button variant="primary" size="sm" onClick={() => startMeeting(s)} style={{ width: '100%', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <Video size={16} /> Start Meeting
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )
        ))}
      </div>
    </>
  );
}
