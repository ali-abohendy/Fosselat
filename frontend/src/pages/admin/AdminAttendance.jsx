import { useState, useEffect } from 'react';
import { Trash2, Edit2, X } from 'lucide-react';
import Button from '../../components/Button';
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

  const [teachers, setTeachers] = useState([]);
  
  // Edit State
  const [editingSession, setEditingSession] = useState(null);
  const [editForm, setEditForm] = useState(null);

  const startEdit = (s) => {
    setEditingSession(s);
    setEditForm({
      student_id: s.student_id || '',
      teacher_id: s.teacher_id || '',
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
      const r = await fetch(`${API}/admin/attendance/${editingSession._id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(editForm)
      });
      const d = await r.json();
      if (d.success) {
        cancelEdit();
        fetchSessions(filterBy, filterValue);
      } else {
        alert(d.message || 'Error updating session');
      }
    } catch {
      alert('Server error updating session');
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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this attendance record? This will revert it back to an unrecorded scheduled session if it was recurring.')) return;
    
    try {
      const r = await fetch(`${API}/admin/attendance/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const d = await r.json();
      if (d.success) {
        setSessions(prev => prev.filter(s => s._id !== id));
      } else {
        alert(d.message || 'Failed to delete record');
      }
    } catch (err) {
      alert('Server error while deleting');
    }
  };

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
                <th style={{textAlign: 'center'}}>Actions</th>
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
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button onClick={() => startEdit(s)} style={{ background: 'transparent', border: 'none', color: 'var(--color-gold)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', borderRadius: '4px', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background='rgba(200,167,99,0.1)'} onMouseLeave={e => e.currentTarget.style.background='transparent'} title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(s._id)} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', borderRadius: '4px', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background='rgba(248,113,113,0.1)'} onMouseLeave={e => e.currentTarget.style.background='transparent'} title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filteredSessions.length && <tr><td colSpan="11" style={{textAlign:'center',color:'var(--color-text-muted)'}}>No attendance records</td></tr>}
            </tbody>
          </table>
        </div>
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
                <div className="dash-form-group full-width">
                  <label>Teacher</label>
                  <select value={editForm.teacher_id} onChange={e => handleEditChange('teacher_id', e.target.value)} required>
                    <option value="">Select Teacher</option>
                    {teachers.map(t => <option key={t._id} value={t._id}>{t.full_name} {t.family_name || ''}</option>)}
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
