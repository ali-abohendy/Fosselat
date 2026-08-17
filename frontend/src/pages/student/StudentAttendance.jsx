import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import API from '../../config';
const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('fossclat_token')}`,
});

export default function StudentAttendance() {
  const [sessions, setSessions] = useState([]);
  const [searchMonth, setSearchMonth] = useState('');
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
    const d = new Date(monthStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  useEffect(() => {
    document.title = 'Attendance — Student';
    fetch(`${API}/student/sessions`, { headers: getHeaders() })
      .then(r => r.json())
      .then(d => { if (d.success) setSessions(d.data); })
      .catch(() => {});
  }, []);

  const filtered = sessions.filter(s => {
    if (!searchMonth) return true;
    return s.date.startsWith(getMonthPrefix(searchMonth));
  });

  return (
    <>
      <div className="dash-page-header">
        <h2>Attendance & Records</h2>
        <p>Review your past sessions, teacher notes, and provide feedback</p>
      </div>

      <div className="dash-controls" style={{ marginBottom: '20px' }}>
        <select
          value={searchMonth}
          onChange={(e) => setSearchMonth(e.target.value)}
          style={{ width: '100%', maxWidth: '200px', padding: '8px 12px', background: 'transparent', border: '1px solid rgba(200,167,99,0.3)', color: 'var(--color-cream)', borderRadius: '6px' }}
        >
          <option value="" style={{ color: '#000' }}>All Months</option>
          {monthOptions.map(m => <option key={m} value={m} style={{ color: '#000' }}>{m}</option>)}
        </select>
      </div>

      <div className="dash-table-container">
        <table className="dash-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Teacher</th>
              <th>Status</th>
              <th>Teacher's Notes</th>
              <th>Your Review</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s._id}>
                <td>
                  {new Date(s.date).toLocaleDateString()}
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{s.duration}</div>
                </td>
                <td>{s.teacher_name || 'N/A'}</td>
                <td>
                  <span className={`status-badge status-${s.status}`}>{s.status}</span>
                </td>
                <td style={{ maxWidth: '300px', whiteSpace: 'pre-wrap' }}>
                  {s.notes ? (
                    <div style={{ fontSize: '13px' }}>{s.notes}</div>
                  ) : (
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>No notes provided.</span>
                  )}
                </td>
                <td>
                  {s.status?.toLowerCase() !== 'present' ? (
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '13px', fontStyle: 'italic' }}>
                      N/A
                    </span>
                  ) : s.review ? (
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '2px', color: 'var(--color-gold)', fontSize: '16px' }}>
                        {'★'.repeat(s.review.rating)}{'☆'.repeat(5 - s.review.rating)}
                      </div>
                      <button 
                        onClick={() => navigate(`/student/review/${s._id}`)} 
                        style={{ 
                          background: 'transparent', border: 'none', color: 'var(--color-text-muted)', 
                          fontSize: '12px', cursor: 'pointer', textDecoration: 'underline', padding: 0 
                        }}
                      >
                        Edit
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => navigate(`/student/review/${s._id}`)} 
                      style={{ 
                        background: 'rgba(200,167,99,0.1)', border: '1px solid rgba(200,167,99,0.3)', 
                        color: 'var(--color-gold)', borderRadius: '4px', fontSize: '12px', 
                        padding: '6px 12px', cursor: 'pointer', fontWeight: 600
                      }}
                    >
                      Write Review
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>No sessions found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
