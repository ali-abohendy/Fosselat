import { useState, useEffect } from 'react';
import Button from '../../components/Button';
import API from '../../config';
const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('fossclat_token')}`,
});

export default function TeacherSessions() {
  const [sessions, setSessions] = useState([]);
  const [search, setSearch] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [alert, setAlert] = useState(null);
  
  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState('');

  useEffect(() => {
    document.title = 'Session History — Teacher';
    fetchSessions();
  }, []);

  const fetchSessions = () => {
    fetch(`${API}/teacher/sessions`, { headers: getHeaders() })
      .then(r => r.json())
      .then(d => { if (d.success) setSessions(d.data); })
      .catch(() => {});
  };

  const startEdit = (s) => {
    setEditingId(s._id);
    setEditNotes(s.notes || '');
    setEditStatus(s.status || 'present');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditNotes('');
    setEditStatus('');
  };

  const saveEdit = async (id) => {
    try {
      const r = await fetch(`${API}/teacher/sessions/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ notes: editNotes, status: editStatus })
      });
      const d = await r.json();
      if (d.success) {
        setAlert({ type: 'success', msg: 'Session updated successfully' });
        setEditingId(null);
        fetchSessions();
        setTimeout(() => setAlert(null), 3000);
      } else {
        setAlert({ type: 'error', msg: d.message || 'Error updating session' });
      }
    } catch {
      setAlert({ type: 'error', msg: 'Server error' });
    }
  };

  const monthOptions = [...new Set(sessions.map(s => new Date(s.date).toLocaleString('default', { month: 'long', year: 'numeric' })))];

  const filtered = sessions.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = (
      (s.student_name && s.student_name.toLowerCase().includes(q)) ||
      (s.student_family_name && s.student_family_name.toLowerCase().includes(q)) ||
      (s.student_family_id && s.student_family_id.toLowerCase().includes(q))
    );
    const sessionMonth = new Date(s.date).toLocaleString('default', { month: 'long', year: 'numeric' });
    const matchMonth = filterMonth ? sessionMonth === filterMonth : true;
    
    return matchSearch && matchMonth;
  });

  return (
    <>
      <div className="dash-page-header">
        <h2>Session History</h2>
        <p>View your past sessions, student reviews, and edit records</p>
      </div>

      {alert && <div className={`dash-alert dash-alert-${alert.type}`}>{alert.msg}</div>}

      <div className="dash-controls" style={{ marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search by student name or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: '1 1 auto', minWidth: '250px', maxWidth: '400px' }}
        />
        <select
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          style={{
            padding: '8px 14px',
            background: 'rgba(200,167,99,0.06)',
            border: '1px solid rgba(200,167,99,0.2)',
            borderRadius: '8px',
            color: 'var(--color-cream)',
            fontSize: '13px',
            minWidth: '150px',
            flex: '1 1 auto',
            maxWidth: '200px',
            outline: 'none',
            fontFamily: 'var(--font-family)'
          }}
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
              <th>Student</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Notes / Reviews</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => {
              const reviewObj = s.reviews && s.reviews.length > 0 ? s.reviews[0] : null;
              const isEditing = editingId === s._id;
              
              return (
                <tr key={s._id}>
                  <td>
                    {new Date(s.date).toLocaleDateString()}
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{s.duration}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{s.student_name} {s.student_family_name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-gold)' }}>[{s.student_family_id}]</div>
                  </td>
                  <td>{s.subject}</td>
                  <td>
                    {isEditing ? (
                      <select value={editStatus} onChange={e => setEditStatus(e.target.value)} style={{ padding: '4px', fontSize: '12px', minHeight: '30px' }}>
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                      </select>
                    ) : (
                      <span className={`status-badge status-${s.status}`}>{s.status}</span>
                    )}
                  </td>
                  <td style={{ maxWidth: '300px' }}>
                    {isEditing ? (
                      <textarea 
                        value={editNotes} 
                        onChange={e => setEditNotes(e.target.value)}
                        style={{ width: '100%', padding: '4px', fontSize: '13px', minHeight: '60px' }}
                      />
                    ) : (
                      <>
                        {s.notes && (
                          <div style={{ marginBottom: '8px' }}>
                            <strong style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Your Notes:</strong>
                            <div style={{ fontSize: '13px', whiteSpace: 'pre-wrap' }}>{s.notes}</div>
                          </div>
                        )}
                        {reviewObj && (
                          <div style={{ background: 'rgba(200,167,99,0.1)', padding: '8px', borderRadius: '4px', borderLeft: '3px solid var(--color-gold)' }}>
                            <strong style={{ fontSize: '11px', color: 'var(--color-gold)', textTransform: 'uppercase' }}>Student Review:</strong>
                            <div style={{ fontSize: '13px', marginTop: '4px' }}>
                              {'★'.repeat(reviewObj.rating)}{'☆'.repeat(5 - reviewObj.rating)}
                              {reviewObj.comment && <p style={{ margin: '4px 0 0 0' }}>{reviewObj.comment}</p>}
                            </div>
                          </div>
                        )}
                        {!s.notes && !reviewObj && <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>-</span>}
                      </>
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Button variant="primary" size="sm" onClick={() => saveEdit(s._id)}>Save</Button>
                        <Button variant="outline" size="sm" onClick={cancelEdit}>Cancel</Button>
                      </div>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => startEdit(s)}>Edit</Button>
                    )}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>No sessions found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
