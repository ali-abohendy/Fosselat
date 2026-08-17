import { useState, useEffect } from 'react';
import API from '../../config';
const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('fossclat_token')}`,
});

const getMonths = () => {
  const months = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
    });
  }
  return months;
};

export default function AdminAttendance() {
  const [sessions, setSessions] = useState([]);
  const [filterBy, setFilterBy] = useState('all');
  const [filterValue, setFilterValue] = useState('');
  const [search, setSearch] = useState('');
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const fetchSessions = (fb, fv) => {
    const params = fb !== 'all' ? `?filter_by=${fb}&filter_value=${fv}` : '';
    fetch(`${API}/admin/attendance${params}`, { headers: getHeaders() })
      .then(r => r.json())
      .then(d => { if (d.success) setSessions(d.data); })
      .catch(() => {});
  };

  useEffect(() => {
    document.title = 'Attendance — Admin';
    fetchSessions('all', '');
    fetch(`${API}/admin/students`, { headers: getHeaders() }).then(r => r.json()).then(d => { if (d.success) setStudents(d.data); }).catch(() => {});
    fetch(`${API}/admin/teachers`, { headers: getHeaders() }).then(r => r.json()).then(d => { if (d.success) setTeachers(d.data); }).catch(() => {});
  }, []);

  useEffect(() => {
    const interval = setInterval(() => fetchSessions(filterBy, filterValue), 30000);
    return () => clearInterval(interval);
  }, [filterBy, filterValue]);

  const handleFilter = (type, value) => {
    setFilterBy(type);
    setFilterValue(value || '');
    fetchSessions(type, value || '');
  };

  const resetFilter = () => {
    setFilterBy('all');
    setFilterValue('');
    fetchSessions('all', '');
  };

  const months = getMonths();

  const filteredSessions = sessions.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = (
      (s.student_name && s.student_name.toLowerCase().includes(q)) ||
      (s.student_family_name && s.student_family_name.toLowerCase().includes(q)) ||
      (s.student_family_id && s.student_family_id.toLowerCase().includes(q)) ||
      (s.student_id && s.student_id.toLowerCase().includes(q)) ||
      (s.teacher_name && s.teacher_name.toLowerCase().includes(q)) ||
      (s.teacher_id && s.teacher_id.toLowerCase().includes(q))
    );
    return matchSearch;
  });

  return (
    <>
      <div className="dash-page-header">
        <h2>Session Attendance</h2>
        <p>Live attendance tracking — auto-refreshes every 30 seconds</p>
      </div>

      <div className="dash-table-container">
        <div className="dash-table-header">
          <h3>Attendance Records ({sessions.length})</h3>
        </div>

        {/* Filter Bar */}
        <div className="dash-controls" style={{ padding: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap', borderBottom: '1px solid rgba(200,167,99,0.08)' }}>
          <input
            type="text"
            placeholder="Search by student or teacher name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: '1 1 auto', minWidth: '250px', maxWidth: '400px', padding: '8px 14px', background: 'rgba(200,167,99,0.06)', border: '1px solid rgba(200,167,99,0.2)', borderRadius: '8px', color: 'var(--color-cream)', fontSize: '13px', outline: 'none' }}
          />
          <select
            value={filterBy === 'month' ? filterValue : ''}
            onChange={e => e.target.value ? handleFilter('month', e.target.value) : resetFilter()}
            style={{ padding: '8px 14px', background: 'rgba(200,167,99,0.06)', border: '1px solid rgba(200,167,99,0.2)', borderRadius: '8px', color: 'var(--color-cream)', fontSize: '13px', minWidth: '150px', flex: '1 1 auto', maxWidth: '200px', outline: 'none' }}
          >
            <option value="" style={{ color: '#000' }}>All Months</option>
            {months.map(m => <option key={m.value} value={m.value} style={{ color: '#000' }}>{m.label}</option>)}
          </select>
          {filterBy !== 'all' && (
            <span style={{ fontSize: '13px', color: 'var(--color-gold)', cursor: 'pointer', display: 'flex', alignItems: 'center', marginLeft: 'auto' }} onClick={resetFilter}>
              ✕ Clear filter
            </span>
          )}
        </div>

        <div style={{overflowX:'auto'}}>
          <table className="dash-table">
            <thead>
              <tr>
                <th>Student ID</th><th>Student</th><th>Family</th><th>Subject</th><th>Teacher</th>
                <th>Duration</th><th>Status</th><th>Date</th><th>Teacher Notes</th><th>Student Review</th>
              </tr>
            </thead>
            <tbody>
              {filteredSessions.map(s => (
                <tr key={s._id}>
                  <td style={{color:'var(--color-gold)',fontWeight:600}}>{s.student_family_id || '—'}</td>
                  <td>{s.student_name}</td><td>{s.student_family_name}</td>
                  <td>{s.subject}</td><td>{s.teacher_name}</td>
                  <td>{s.duration}</td>
                  <td><span className={`status-badge status-${s.status}`}>{s.status}</span></td>
                  <td>{s.date?.split('T')[0]}</td><td>{s.notes || '—'}</td>
                  <td>
                    {s.student_review ? (
                      <div style={{ fontSize: '13px' }}>
                        <span style={{ color: 'var(--color-gold)' }}>{'★'.repeat(s.student_review.rating)}</span>
                        {s.student_review.comment && <div style={{ color: 'var(--color-text-muted)', marginTop: '4px' }}>{s.student_review.comment}</div>}
                      </div>
                    ) : (
                      <span style={{ color: 'var(--color-text-muted)' }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
              {!filteredSessions.length && <tr><td colSpan="10" style={{textAlign:'center',color:'var(--color-text-muted)'}}>No attendance records</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
