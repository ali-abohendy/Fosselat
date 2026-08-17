import { useState, useEffect } from 'react';
import API from '../../config';
import MonthlyCalendar from '../../components/MonthlyCalendar';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('fossclat_token')}`,
});

export default function StudentCalendar() {
  const [scheduled, setScheduled] = useState([]);
  const [pastSessions, setPastSessions] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));

  useEffect(() => {
    document.title = 'Calendar — Student';
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1; // 1-indexed for backend

    fetch(`${API}/student/calendar?year=${year}&month=${month}`, { headers: getHeaders() })
      .then(r => r.json())
      .then(d => { 
        if (d.success) {
          setScheduled(d.data.scheduled || []); 
          setPastSessions(d.data.past_sessions || []);
        }
      })
      .catch(() => {});
  }, [currentDate]);

  return (
    <>
      <div className="dash-page-header">
        <h2>My Calendar</h2>
        <p>Your upcoming classes and links to join</p>
      </div>

      <MonthlyCalendar 
        scheduled={scheduled} 
        pastSessions={pastSessions}
        type="student" 
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
      />
    </>
  );
}
