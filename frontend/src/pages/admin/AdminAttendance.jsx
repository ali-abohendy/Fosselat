import { useState, useEffect } from 'react';

import API from '../../config.js';
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
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '10px',
          padding: '12px 16px',
          borderBottom: '1px solid rgba(200,167,99,0.08)',
          alignItems: 'center',
        }}>
          <button className={`dash-filter-btn ${filterBy === 'all' ? 'active' : ''}`} onClick={resetFilter}>
            All
          </button>
          <select className="dash-filter-btn"
            value={filterBy === 'month' ? filterValue : ''}
            onChange={e => e.target.value ? handleFilter('month', e.target.value) : resetFilter()}
            style={{ minWidth: '160px' }}>
            <option value="">Month</option>
            {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <select className="dash-filter-btn"
            value={filterBy === 'teacher' ? filterValue : ''}
            onChange={e => e.target.value ? handleFilter('teacher', e.target.value) : resetFilter()}>
            <option value="">Teacher</option>
            {teachers.map(t => <option key={t._id} value={t._id}>{t.full_name}</option>)}
          </select>
          <select className="dash-filter-btn"
            value={filterBy === 'student' ? filterValue : ''}
            onChange={e => e.target.value ? handleFilter('student', e.target.value) : resetFilter()}>
            <option value="">Student</option>
            {students.map(s => <option key={s._id} value={s._id}>[{s.student_id}] {s.full_name}</option>)}
          </select>
          {filterBy !== 'all' && (
            <span style={{ fontSize: '12px', color: 'var(--color-gold)', cursor: 'pointer' }} onClick={resetFilter}>
              ✕ Clear filter
            </span>
          )}
        </div>

        <div style={{overflowX:'auto'}}>
          <table className="dash-table">
            <thead>
              <tr>
                <th>Student ID</th><th>Student</th><th>Family</th><th>Subject</th><th>Teacher</th>
                <th>Duration</th><th>Status</th><th>Date</th><th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map(s => (
                <tr key={s._id}>
                  <td style={{color:'var(--color-gold)',fontWeight:600}}>{s.student_family_id || '—'}</td>
                  <td>{s.student_name}</td><td>{s.student_family_name}</td>
                  <td>{s.subject}</td><td>{s.teacher_name}</td>
                  <td>{s.duration}</td>
                  <td><span className={`status-badge status-${s.status}`}>{s.status}</span></td>
                  <td>{s.date?.split('T')[0]}</td><td>{s.notes || '—'}</td>
                </tr>
              ))}
              {!sessions.length && <tr><td colSpan="9" style={{textAlign:'center',color:'var(--color-text-muted)'}}>No attendance records</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
