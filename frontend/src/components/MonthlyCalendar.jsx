import { useMemo } from 'react';
import { Video } from './Icons';
import Button from './Button';
import './MonthlyCalendar.css';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Helper to get all dates in a month
const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

export default function MonthlyCalendar({ scheduled = [], pastSessions = [], type = 'student', currentDate, setCurrentDate }) {
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const monthName = currentDate.toLocaleString('default', { month: 'short' }).toUpperCase();
  const yearName = currentDate.getFullYear();
  
  // Calculate grid
  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); // 0 (Sun) to 6 (Sat)
  
  const blanks = Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`blank-${i}`} className="calendar-cell blank"></div>);
  
  const today = new Date();
  today.setHours(0,0,0,0);

  // Project events onto dates
  const days = Array.from({ length: daysInMonth }).map((_, i) => {
    const dateNum = i + 1;
    const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), dateNum);
    const localYear = dateObj.getFullYear();
    const localMonth = String(dateObj.getMonth() + 1).padStart(2, '0');
    const localDay = String(dateObj.getDate()).padStart(2, '0');
    const dateStr = `${localYear}-${localMonth}-${localDay}`;
    const dayOfWeekStr = DAYS_OF_WEEK[dateObj.getDay()];
    
    // Check if this date is strictly in the past
    const isPast = dateObj < today;

    let dayEvents = [];

    // Always fetch recorded sessions for this date (they act as 'past/completed' visually)
    const recordedEvents = pastSessions.filter(s => s.date === dateStr).map(s => ({...s, isPast: true}));
    dayEvents.push(...recordedEvents);

    if (dateObj >= today) {
      // For today or future, project recurring scheduled classes 
      // ONLY IF they haven't been recorded yet on this specific date.
      const scheduledEvents = scheduled.filter(s => s.day === dayOfWeekStr && s.active);
      
      const unrecordedScheduled = scheduledEvents.filter(s => {
        // Find if this specific scheduled class has already been recorded
        return !recordedEvents.some(re => re.student_id === s.student_id);
      }).map(s => ({...s, isPast: false}));

      dayEvents.push(...unrecordedScheduled);
    }
    
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
      <div key={`day-${dateNum}`} className="calendar-cell">
        <div className="cell-date">{dateNum}</div>
        <div className="cell-events">
          {dayEvents.map((evt, idx) => {
            const isPresent = evt.status === 'completed' || evt.status === 'present';
            const isAbsent = evt.status === 'absent' || evt.status === 'cancelled';
            const cardClass = evt.isPast 
              ? (isPresent ? 'session-card past-present' : isAbsent ? 'session-card past-absent' : 'session-card past-unknown')
              : 'session-card future';

            return (
              <div key={evt._id + idx} className={cardClass}>
                <div className="card-header">
                  <div>
                    {type === 'student' ? (
                      <div className="card-title">Teacher: {evt.teacher_name || 'Assigned soon'}</div>
                    ) : (
                      <div className="card-title">Student: {evt.student_name}</div>
                    )}
                    <div className="card-subtitle">{evt.subject || 'Class'}</div>
                  </div>
                  <div className="card-time">
                    <div className="time">{formatTimeStr(evt.start_time)}</div>
                    <div className="dur">{evt.duration}</div>
                  </div>
                </div>

                {evt.isPast ? (
                  <div className="card-status" style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '500', color: isPresent ? 'var(--color-success)' : isAbsent ? 'var(--color-error)' : 'var(--color-text-muted)' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: isPresent ? 'var(--color-success)' : isAbsent ? 'var(--color-error)' : 'var(--color-text-muted)' }}></div>
                    {evt.status ? (evt.status.charAt(0).toUpperCase() + evt.status.slice(1)) : 'Unknown'}
                  </div>
                ) : (
                  <div className="card-actions">
                    {evt.zoom_link && (
                      <Button variant="primary" size="sm" onClick={() => window.open(evt.zoom_link, '_blank')} style={{ flex: 1, fontSize: '11px', padding: '6px' }}>
                        <Video size={14} style={{ marginRight: '4px' }}/> Zoom
                      </Button>
                    )}
                    {evt.google_meet_link && (
                      <Button variant="primary" size="sm" onClick={() => window.open(evt.google_meet_link, '_blank')} style={{ flex: 1, fontSize: '11px', padding: '6px' }}>
                        <Video size={14} style={{ marginRight: '4px' }}/> Meet
                      </Button>
                    )}
                    {!evt.zoom_link && !evt.google_meet_link && (
                      <span className="no-link">No link yet</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  });

  const totalSlots = [...blanks, ...days];

  return (
    <div className="monthly-calendar">
      <div className="calendar-header">
        <button onClick={prevMonth} className="calendar-nav-btn">&#10094;</button>
        <h2 className="calendar-title">{monthName} {yearName}</h2>
        <button onClick={nextMonth} className="calendar-nav-btn">&#10095;</button>
      </div>

      <div className="calendar-grid">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
          <div key={`head-${i}`} className="calendar-day-head">{d}</div>
        ))}
        {totalSlots}
      </div>
    </div>
  );
}
