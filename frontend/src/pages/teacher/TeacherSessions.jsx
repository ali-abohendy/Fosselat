import { useState, useEffect } from 'react';
import { Edit2, Trash2, X } from 'lucide-react';
import Button from '../../components/Button';
import API from '../../config';
const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('fossclat_token')}`,
});

export default function TeacherSessions() {
  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [alert, setAlert] = useState(null);
  
  // Edit state (Modal)
  const [editingSession, setEditingSession] = useState(null);
  const [editForm, setEditForm] = useState(null);

  useEffect(() => {
    document.title = 'Session History — Teacher';
    fetchSessions();
    fetchStudents();
  }, []);

  const fetchSessions = () => {
    fetch(`${API}/teacher/sessions`, { headers: getHeaders() })
      .then(r => r.json())
      .then(d => { if (d.success) setSessions(d.data); })
      .catch(() => {});
  };

  const fetchStudents = () => {
    fetch(`${API}/teacher/students`, { headers: getHeaders() })
      .then(r => r.json())
      .then(d => { if (d.success) setStudents(d.data); })
      .catch(() => {});
  };

  const startEdit = (s) => {
    setEditingSession(s);
    setEditForm({
      student_id: s.student_id || '',
      date: s.date ? s.date.split('T')[0] : '',
      start_time: s.start_time || '',
      end_time: s.end_time || '',
      duration: s.duration || '60 min',
      subject: s.subject || '',
      status: s.status || 'present',
      notes: s.notes || ''
    });
  };

  const cancelEdit = () => {
    setEditingSession(null);
    setEditForm(null);
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    try {
      const r = await fetch(`${API}/teacher/sessions/${editingSession._id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(editForm)
      });
      const d = await r.json();
      if (d.success) {
        setAlert({ type: 'success', msg: 'Session updated successfully' });
        cancelEdit();
        fetchSessions();
        setTimeout(() => setAlert(null), 3000);
      } else {
        setAlert({ type: 'error', msg: d.message || 'Error updating session' });
      }
    } catch {
      setAlert({ type: 'error', msg: 'Server error' });
    }
  };

  const deleteSession = async (id) => {
    if (!window.confirm('Are you sure you want to delete this session?')) return;
    try {
      const r = await fetch(`${API}/teacher/sessions/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const d = await r.json();
      if (d.success) {
        setAlert({ type: 'success', msg: 'Session deleted' });
        fetchSessions();
        setTimeout(() => setAlert(null), 3000);
      } else {
        setAlert({ type: 'error', msg: d.message || 'Error deleting session' });
      }
    } catch {
      setAlert({ type: 'error', msg: 'Server error' });
    }
  };

  const handleEditChange = (field, val) => {
    setEditForm(prev => {
      const updated = { ...prev, [field]: val };
      if (field === 'start_time' || field === 'duration') {
        const dur = parseInt(updated.duration) || 60;
        if (updated.start_time) {
            const [h, m] = updated.start_time.split(':').map(Number);
            const endMins = h * 60 + m + dur;
            const endH = Math.floor(endMins / 60) % 24;
            const endM = endMins % 60;
            updated.end_time = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
        }
      }
      return updated;
    });
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
              <th style={{textAlign: 'center'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => {
              const reviewObj = s.reviews && s.reviews.length > 0 ? s.reviews[0] : null;
              
              return (
                <tr key={s._id}>
                  <td>
                    {new Date(s.date).toLocaleDateString()}
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{s.start_time} - {s.end_time} ({s.duration})</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{s.student_name} {s.student_family_name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-gold)' }}>[{s.student_family_id}]</div>
                  </td>
                  <td>{s.subject}</td>
                  <td>
                    <span className={`status-badge status-${s.status}`}>{s.status}</span>
                  </td>
                  <td style={{ maxWidth: '300px' }}>
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
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button onClick={() => startEdit(s)} style={{ background: 'transparent', border: 'none', color: 'var(--color-gold)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', borderRadius: '4px', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background='rgba(200,167,99,0.1)'} onMouseLeave={e => e.currentTarget.style.background='transparent'} title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => deleteSession(s._id)} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', borderRadius: '4px', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background='rgba(248,113,113,0.1)'} onMouseLeave={e => e.currentTarget.style.background='transparent'} title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
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

      {editingSession && editForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="dash-form-container" style={{ width: '100%', maxWidth: '600px', background: 'var(--color-bg-dark)', borderRadius: '12px', padding: '24px', position: 'relative', border: '1px solid var(--color-gold)', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={cancelEdit} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            <h3 style={{ marginTop: 0 }}>Edit Session Record</h3>
            <form onSubmit={saveEdit}>
              <div className="dash-form-grid">
                <div className="dash-form-group full-width">
                  <label>Student</label>
                  <select value={editForm.student_id} onChange={e => handleEditChange('student_id', e.target.value)} required>
                    <option value="">Select Student</option>
                    {students.map(st => <option key={st._id} value={st._id}>{st.full_name} {st.family_name || ''}</option>)}
                  </select>
                </div>
                <div className="dash-form-group">
                  <label>Date</label>
                  <input type="date" value={editForm.date} onChange={e => handleEditChange('date', e.target.value)} required />
                </div>
                <div className="dash-form-group">
                  <label>Status</label>
                  <select value={editForm.status} onChange={e => handleEditChange('status', e.target.value)}>
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                  </select>
                </div>
                <div className="dash-form-group">
                  <label>Duration</label>
                  <select value={editForm.duration} onChange={e => handleEditChange('duration', e.target.value)}>
                    {['30 min', '40 min', '45 min', '60 min', '90 min', '120 min'].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="dash-form-group">
                  <label>Start Time</label>
                  <input type="time" value={editForm.start_time} onChange={e => handleEditChange('start_time', e.target.value)} required />
                </div>
                <div className="dash-form-group">
                  <label>End Time</label>
                  <input type="time" value={editForm.end_time} readOnly style={{ opacity: 0.7 }} />
                </div>
                <div className="dash-form-group full-width">
                  <label>Subjects</label>
                  <input type="text" value={editForm.subject} onChange={e => handleEditChange('subject', e.target.value)} placeholder="e.g. Quran, Arabic" />
                </div>
                <div className="dash-form-group full-width">
                  <label>Notes</label>
                  <textarea rows="3" value={editForm.notes} onChange={e => handleEditChange('notes', e.target.value)} />
                </div>
                <div className="dash-form-actions full-width" style={{ display: 'flex', gap: '12px' }}>
                  <Button type="submit" variant="primary">Save Changes</Button>
                  <Button type="button" variant="outline" onClick={cancelEdit}>Cancel</Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
