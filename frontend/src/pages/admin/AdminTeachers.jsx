import { useState, useEffect } from 'react';
import Button from '../../components/Button';
import API from '../../config';
const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('fossclat_token')}`,
});

const emptyForm = {
  full_name: '', family_name: '', status: 'active', hourly_rate: '',
  zoom_link: '', google_meet_link: '',
};

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [alert, setAlert] = useState(null);
  const [credentials, setCredentials] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTeachers = () => {
    fetch(`${API}/admin/teachers`, { headers: getHeaders() })
      .then(r => r.json())
      .then(d => { if (d.success) setTeachers(d.data); })
      .catch(() => {});
  };

  useEffect(() => { document.title = 'Teachers — Admin'; fetchTeachers(); }, []);

  const validate = () => {
    const errors = [];
    if (!form.full_name.trim()) errors.push('Teacher Name is required');
    if (!form.family_name.trim()) errors.push('Family Name is required');
    if (!form.hourly_rate) errors.push('Hourly Rate is required');
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null); setCredentials(null); setValidationErrors([]);

    const errors = validate();
    if (errors.length) {
      setValidationErrors(errors);
      setAlert({ type: 'error', msg: `Please fix ${errors.length} error(s) below.` });
      return;
    }

    const url = editingId ? `${API}/admin/teachers/${editingId}` : `${API}/admin/teachers`;
    const method = editingId ? 'PUT' : 'POST';
    try {
      const r = await fetch(url, { method, headers: getHeaders(), body: JSON.stringify(form) });
      const d = await r.json();
      if (d.success) {
        if (d.data?.email && d.data?.generated_password) {
          setCredentials({ email: d.data.email, password: d.data.generated_password });
        }
        setAlert({ type: 'success', msg: editingId ? 'Teacher updated!' : 'Teacher added!' });
        setForm(emptyForm); setEditingId(null); fetchTeachers();
      } else { setAlert({ type: 'error', msg: d.message || 'Error' }); }
    } catch { setAlert({ type: 'error', msg: 'Server error' }); }
  };

  const handleEdit = (t) => {
    setEditingId(t._id); setCredentials(null); setValidationErrors([]);
    setForm({
      full_name: t.full_name || '', family_name: t.family_name || '',
      status: t.status || 'active', hourly_rate: t.hourly_rate || '',
      zoom_link: t.zoom_link || '', google_meet_link: t.google_meet_link || '',
    });
  };

  return (
    <>
      <div className="dash-page-header">
        <h2>Teacher Management</h2>
        <p>Add and manage teacher records — credentials are auto-generated on creation</p>
      </div>

      {alert && <div className={`dash-alert dash-alert-${alert.type}`}>{alert.msg}</div>}

      {validationErrors.length > 0 && (
        <div className="dash-alert dash-alert-error" style={{ lineHeight: 1.8 }}>
          {validationErrors.map((err, i) => <div key={i}>⚠ {err}</div>)}
        </div>
      )}

      {credentials && (
        <div className="dash-alert dash-alert-success" style={{ lineHeight: 1.8 }}>
          <strong>📋 Teacher Credentials (share with teacher):</strong><br />
          Email: <strong>{credentials.email}</strong><br />
          Password: <strong>{credentials.password}</strong>
        </div>
      )}

      <div className="dash-form-container">
        <h3>{editingId ? 'Edit Teacher' : 'Add Teacher'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="dash-form-grid">
            <div className="dash-form-group">
              <label>Teacher Name <span style={{color:'var(--color-gold)'}}>*</span></label>
              <input value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})}
                placeholder="First name" required />
            </div>
            <div className="dash-form-group">
              <label>Family Name <span style={{color:'var(--color-gold)'}}>*</span></label>
              <input value={form.family_name} onChange={e => setForm({...form, family_name: e.target.value})}
                placeholder="Family / Last name" required />
            </div>
            <div className="dash-form-group">
              <label>Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} required>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="dash-form-group">
              <label>Hourly Rate (L.E) <span style={{color:'var(--color-gold)'}}>*</span></label>
              <input type="number" value={form.hourly_rate} onChange={e => setForm({...form, hourly_rate: e.target.value})}
                placeholder="e.g. 8" required />
            </div>
            <div className="dash-form-group">
              <label>Zoom Meeting Link</label>
              <input value={form.zoom_link} onChange={e => setForm({...form, zoom_link: e.target.value})}
                placeholder="https://zoom.us/j/..." />
            </div>
            <div className="dash-form-group">
              <label>Google Meet Link</label>
              <input value={form.google_meet_link} onChange={e => setForm({...form, google_meet_link: e.target.value})}
                placeholder="https://meet.google.com/..." />
            </div>
            <div className="dash-form-actions">
              <Button type="submit" variant="primary">{editingId ? 'Update' : 'Add Teacher'}</Button>
              {editingId && <Button variant="outline" onClick={() => { setEditingId(null); setForm(emptyForm); setValidationErrors([]); }}>Cancel</Button>}
            </div>
          </div>
        </form>
      </div>

      <div className="dash-table-container">
        <div className="dash-table-header">
          <h3>All Teachers ({teachers.length})</h3>
          <input
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              padding: '8px 14px',
              background: 'rgba(200,167,99,0.06)',
              border: '1px solid rgba(200,167,99,0.2)',
              borderRadius: '8px',
              color: 'var(--color-cream)',
              fontSize: '13px',
              minWidth: '220px',
              outline: 'none',
              fontFamily: 'var(--font-family)',
            }}
          />
        </div>
        <div style={{overflowX:'auto'}}>
          <table className="dash-table">
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>Password</th><th>Status</th><th>Rate/hr</th>
                <th>Zoom Link</th><th>Google Meet Link</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers
                .filter(t => {
                  if (!searchQuery.trim()) return true;
                  const q = searchQuery.toLowerCase();
                  return (
                    (t.full_name || '').toLowerCase().includes(q) ||
                    (t.family_name || '').toLowerCase().includes(q) ||
                    (t.email || '').toLowerCase().includes(q)
                  );
                })
                .map(t => (
                <tr key={t._id}>
                  <td>{t.full_name} {t.family_name}</td>
                  <td style={{fontSize:'12px'}}>{t.email || '—'}</td>
                  <td style={{fontSize:'12px'}}>{t.generated_password || t.plain_password || '—'}</td>
                  <td><span className={`status-badge status-${t.status}`}>{t.status}</span></td>
                  <td>{t.hourly_rate || 0} L.E</td>
                  <td style={{fontSize:'12px'}}>{t.zoom_link ? <a href={t.zoom_link} target="_blank" rel="noreferrer">Zoom</a> : '—'}</td>
                  <td style={{fontSize:'12px'}}>{t.google_meet_link ? <a href={t.google_meet_link} target="_blank" rel="noreferrer">Meet</a> : '—'}</td>
                  <td><button className="dash-filter-btn" onClick={() => handleEdit(t)}>Edit</button></td>
                </tr>
              ))}
              {!teachers.length && <tr><td colSpan="10" style={{textAlign:'center',color:'var(--color-text-muted)'}}>No teachers yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
