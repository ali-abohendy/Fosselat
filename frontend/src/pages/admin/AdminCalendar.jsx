import { useState, useEffect, useMemo } from 'react';
import API from '../../config';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, BookOpen, Video, Trash2 } from 'lucide-react';
import Button from '../../components/Button';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('fossclat_token')}`,
});

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function AdminCalendar() {
  const [scheduled, setScheduled] = useState([]);
  const [pastSessions, setPastSessions] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);

  // We track the currently fetched month so we don't refetch on every day change if in the same month
  const [fetchedMonth, setFetchedMonth] = useState(''); 

  const fetchSessionsForMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const monthKey = `${year}-${month}`;

    if (monthKey === fetchedMonth) return;

    setLoading(true);
    fetch(`${API}/admin/calendar?year=${year}&month=${month}`, { headers: getHeaders() })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setScheduled(d.data.scheduled || []);
          setPastSessions(d.data.past_sessions || []);
          setFetchedMonth(monthKey);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    document.title = "Daily Calendar — Admin";
    fetchSessionsForMonth(currentDate);
  }, [currentDate]);

  const goPrev = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    setCurrentDate(d);
  };

  const goNext = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    setCurrentDate(d);
  };

  const goToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = currentDate.toDateString() === new Date().toDateString();

  // Compute events for the specific selected day
  const dayEvents = useMemo(() => {
    const localYear = currentDate.getFullYear();
    const localMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
    const localDay = String(currentDate.getDate()).padStart(2, '0');
    const dateStr = `${localYear}-${localMonth}-${localDay}`;
    const dayOfWeekStr = DAYS_OF_WEEK[currentDate.getDay()];
    
    const today = new Date();
    today.setHours(0,0,0,0);
    const isPast = currentDate < today;

    let events = [];

    // Recorded sessions for this date
    const recordedEvents = pastSessions.filter(s => s.date === dateStr).map(s => ({...s, isPast: true}));
    events.push(...recordedEvents);

    if (currentDate >= today) {
      // Unrecorded recurring scheduled classes
      const scheduledEvents = scheduled.filter(s => s.day === dayOfWeekStr && s.active);
      const unrecordedScheduled = scheduledEvents.filter(s => {
        return !recordedEvents.some(re => re.student_id === s.student_id && re.start_time === s.start_time);
      }).map(s => ({...s, isPast: false}));

      events.push(...unrecordedScheduled);
    }

    // Sort by time
    return events.sort((a, b) => {
      const tA = a.start_time || '00:00';
      const tB = b.start_time || '00:00';
      return tA.localeCompare(tB);
    });
  }, [currentDate, scheduled, pastSessions]);

  const formatTimeStr = (timeStr) => {
    if (!timeStr) return '';
    if (timeStr.includes('T')) {
      try {
        const d = new Date(timeStr);
        return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
      } catch { return timeStr; }
    }
    return timeStr;
  };

  return (
    <>
      <style>{`
        .admin-day-card {
          background: rgba(10, 26, 40, 0.4);
          border-radius: 16px;
          padding: 20px;
          border: 1px solid rgba(200, 167, 99, 0.15);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
          display: flex;
          flex-direction: column;
          gap: 16px;
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease, border-color 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .admin-day-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
          border-color: rgba(200, 167, 99, 0.4);
        }
        .admin-day-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 4px;
          background: linear-gradient(90deg, transparent, rgba(200, 167, 99, 0.5), transparent);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .admin-day-card:hover::before {
          opacity: 1;
        }
        .adc-status {
          font-size: 11px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .adc-status.present, .adc-status.completed { background: rgba(40, 167, 69, 0.15); color: #4ade80; border: 1px solid rgba(40, 167, 69, 0.3); }
        .adc-status.absent, .adc-status.cancelled { background: rgba(220, 53, 69, 0.15); color: #f87171; border: 1px solid rgba(220, 53, 69, 0.3); }
        .adc-status.unknown { background: rgba(255, 255, 255, 0.05); color: var(--color-text-muted); border: 1px solid rgba(255, 255, 255, 0.1); }
      `}</style>

      <div className="dash-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2>Daily Agenda</h2>
          <p>Academy classes scheduled for {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(200,167,99,0.05)', padding: '8px', borderRadius: '12px', border: '1px solid rgba(200,167,99,0.1)' }}>
          <button onClick={goPrev} style={{ background: 'transparent', border: 'none', color: 'var(--color-cream)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', borderRadius: '8px', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
            <ChevronLeft size={20} />
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 12px', minWidth: '150px', justifyContent: 'center' }}>
            <CalendarIcon size={16} color="var(--color-gold)" />
            <span style={{ color: 'var(--color-cream)', fontWeight: 600, fontSize: '15px' }}>
              {currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          <button onClick={goNext} style={{ background: 'transparent', border: 'none', color: 'var(--color-cream)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', borderRadius: '8px', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
            <ChevronRight size={20} />
          </button>
          
          {!isToday && (
            <Button variant="outline" size="sm" onClick={goToday} style={{ marginLeft: '8px' }}>Today</Button>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>Loading sessions...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px', alignItems: 'start' }}>
          {dayEvents.length > 0 ? dayEvents.map((evt, idx) => {
            const isPresent = evt.status === 'completed' || evt.status === 'present';
            const isAbsent = evt.status === 'absent' || evt.status === 'cancelled';
            const statusClass = isPresent ? 'present' : isAbsent ? 'absent' : 'unknown';

            return (
              <div key={evt._id + idx} className="admin-day-card">
                
                {/* Header: Time and Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: 'rgba(200,167,99,0.1)', padding: '10px', borderRadius: '10px', color: 'var(--color-gold)' }}>
                      <Clock size={20} />
                    </div>
                    <div>
                      <div style={{ color: 'var(--color-cream)', fontWeight: 'bold', fontSize: '18px' }}>{formatTimeStr(evt.start_time)}</div>
                      <div style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>{evt.duration} mins</div>
                    </div>
                  </div>
                  {evt.isPast && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={`adc-status ${statusClass}`}>
                        {evt.status ? evt.status : 'Unknown'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info: Student, Teacher, Subject */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={16} />
                    </div>
                    <div>
                      <div style={{ color: 'var(--color-text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Student</div>
                      <div style={{ color: 'var(--color-cream)', fontSize: '14px', fontWeight: 500 }}>
                        {evt.student_name} {evt.student_family_name} <span style={{ color: 'var(--color-gold)', fontSize: '12px' }}>[{evt.student_family_id}]</span>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={16} />
                    </div>
                    <div>
                      <div style={{ color: 'var(--color-text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Teacher</div>
                      <div style={{ color: 'var(--color-cream)', fontSize: '14px' }}>{evt.teacher_name || 'Assigned soon'}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BookOpen size={16} />
                    </div>
                    <div>
                      <div style={{ color: 'var(--color-text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Subject</div>
                      <div style={{ color: 'var(--color-cream)', fontSize: '14px' }}>{evt.subject}</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ marginTop: 'auto', paddingTop: '12px', display: 'flex', gap: '8px' }}>
                  {!evt.isPast ? (
                    <>
                      {evt.zoom_link && (
                        <Button variant="primary" size="sm" onClick={() => window.open(evt.zoom_link, '_blank')} style={{ flex: 1, fontSize: '12px', padding: '8px' }}>
                          <Video size={16} style={{ marginRight: '6px' }}/> Zoom
                        </Button>
                      )}
                      {evt.google_meet_link && (
                        <Button variant="primary" size="sm" onClick={() => window.open(evt.google_meet_link, '_blank')} style={{ flex: 1, fontSize: '12px', padding: '8px' }}>
                          <Video size={16} style={{ marginRight: '6px' }}/> Meet
                        </Button>
                      )}
                      {!evt.zoom_link && !evt.google_meet_link && (
                        <div style={{ width: '100%', textAlign: 'center', padding: '8px', color: 'var(--color-text-muted)', fontSize: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                          No meeting link assigned
                        </div>
                      )}
                    </>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => setSelectedReview(evt)} style={{ flex: 1, fontSize: '12px', padding: '8px', borderColor: 'rgba(200,167,99,0.3)', color: 'var(--color-gold)' }}>
                      View Review
                    </Button>
                  )}
                </div>
              </div>
            );
          }) : (
            <div style={{ gridColumn: '1 / -1', padding: '60px 20px', textAlign: 'center', background: 'var(--color-bg-light)', borderRadius: '16px', border: '1px dashed rgba(200,167,99,0.3)' }}>
              <CalendarIcon size={48} color="rgba(200,167,99,0.2)" style={{ marginBottom: '16px' }} />
              <h3 style={{ color: 'var(--color-cream)', marginBottom: '8px' }}>No Sessions Scheduled</h3>
              <p style={{ color: 'var(--color-text-muted)' }}>There are no classes scheduled for this date across the academy.</p>
            </div>
          )}
        </div>
      )}

      {selectedReview && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }} onClick={() => setSelectedReview(null)}>
          <div style={{ background: 'var(--color-bg-light)', padding: '24px', borderRadius: '16px', width: '100%', maxWidth: '400px', border: '1px solid rgba(200,167,99,0.2)', boxShadow: '0 10px 40px rgba(0,0,0,0.4)' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: 'var(--color-gold)', marginBottom: '16px', fontSize: '18px' }}>Session Review</h3>
            
            <div style={{ marginBottom: '20px' }}>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Teacher Notes</div>
              <div style={{ color: 'var(--color-cream)', fontSize: '14px', lineHeight: 1.5, background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px' }}>
                {selectedReview.notes || 'No notes provided by the teacher.'}
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Student Review</div>
              <div style={{ color: 'var(--color-cream)', fontSize: '14px', lineHeight: 1.5, background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px' }}>
                {selectedReview.student_review ? (
                  <>
                    <div style={{ color: 'var(--color-gold)', marginBottom: '8px', fontSize: '16px' }}>{'★'.repeat(selectedReview.student_review.rating)}</div>
                    <div>{selectedReview.student_review.comment || 'No comment provided.'}</div>
                  </>
                ) : (
                  <span style={{ color: 'var(--color-text-muted)' }}>No review submitted yet.</span>
                )}
              </div>
            </div>

            <Button variant="primary" style={{ width: '100%' }} onClick={() => setSelectedReview(null)}>Close</Button>
          </div>
        </div>
      )}
    </>
  );
}
