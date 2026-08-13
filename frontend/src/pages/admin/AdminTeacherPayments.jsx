import { useState, useEffect } from 'react';
import Button from '../../components/Button';

import API from '../../config.js';
const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('fossclat_token')}`,
});

const emptyForm = { teacher_id: '', teacher_name: '', month: '', time_hours: '', total_salary: '', bonuses: '', deductions: '', net_salary: '' };

export default function AdminTeacherPayments() {
  const [payments, setPayments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [alert, setAlert] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // Month options (last 12 months)
  const getMonths = () => {
    const months = [];
    const d = new Date();
    for (let i = 0; i < 12; i++) {
      months.push(new Date(d.getFullYear(), d.getMonth() - i, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
    }
    return months;
  };
  const monthOptions = getMonths();

  const fetchPayments = () => {
    fetch(`${API}/admin/payments/teachers`, { headers: getHeaders() })
      .then(r => r.json()).then(d => { if (d.success) setPayments(d.data); }).catch(() => {});
  };
  
  const fetchSessions = async (teacherId, monthPrefix) => {
    try {
      const r = await fetch(`${API}/admin/attendance?teacher_id=${teacherId}&month=${monthPrefix}`, { headers: getHeaders() });
      const d = await r.json();
      if (d.success) return d.data;
      return [];
    } catch { return []; }
  };

  useEffect(() => {
    document.title = 'Teacher Payroll — Admin';
    fetchPayments();
    fetch(`${API}/admin/teachers`, { headers: getHeaders() })
      .then(r => r.json()).then(d => { if (d.success) setTeachers(d.data); }).catch(() => {});
  }, []);

  // Format e.g., 'July 2026' to '2026-07' to match session dates (which are like '2026-07-20')
  const getMonthPrefix = (monthStr) => {
    const d = new Date(monthStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  useEffect(() => {
    const calc = async () => {
      if (form.teacher_id && form.month) {
        const t = teachers.find(x => x._id === form.teacher_id);
        if (t) {
          const prefix = getMonthPrefix(form.month);
          const teacherSessions = await fetchSessions(form.teacher_id, prefix);
          const presentSessions = teacherSessions.filter(s => s.status === 'present');
          
          const totalMins = presentSessions.reduce((acc, s) => acc + (Number(s.duration_minutes) || parseInt(s.duration) || 0), 0);
          const hours = (totalMins / 60).toFixed(2);
          
          const rate = parseFloat(t.hourly_rate) || 0;
          const gross = hours * rate;
          
          // Don't override bonuses/deductions if they are already typed
          const bonuses = parseFloat(form.bonuses) || 0;
          const deductions = parseFloat(form.deductions) || 0;
          const net = gross + bonuses - deductions;

          setForm(prev => ({
            ...prev,
            time_hours: hours,
            total_salary: gross.toFixed(2),
            net_salary: net.toFixed(2),
            teacher_name: `${t.full_name} ${t.family_name || ''}`.trim()
          }));
        }
      }
    };
    calc();
  }, [form.teacher_id, form.month, form.bonuses, form.deductions]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setAlert(null);
    try {
      const url = editingId ? `${API}/admin/payments/teachers/${editingId}` : `${API}/admin/payments/teachers`;
      const method = editingId ? 'PUT' : 'POST';
      const r = await fetch(url, { method, headers: getHeaders(), body: JSON.stringify(form) });
      const d = await r.json();
      if (d.success) { 
        setAlert({ type: 'success', msg: editingId ? 'Payroll updated!' : 'Payroll recorded!' }); 
        setForm(emptyForm); 
        setEditingId(null);
        fetchPayments(); 
      }
      else setAlert({ type: 'error', msg: d.message || 'Error' });
    } catch { setAlert({ type: 'error', msg: 'Server error' }); }
  };
  
  const handleEdit = (p) => {
    setEditingId(p._id);
    setForm({
      teacher_id: p.teacher_id || '',
      teacher_name: p.teacher_name || '',
      month: p.month || '',
      time_hours: p.time_hours || '',
      total_salary: p.total_salary || '',
      bonuses: p.bonuses || '',
      deductions: p.deductions || '',
      net_salary: p.net_salary || '',
    });
  };

  return (
    <>
      <div className="dash-page-header">
        <h2>Teacher Payroll Sheet</h2>
        <p>Record and track teacher payments (auto-calculated from attendance)</p>
      </div>
      {alert && <div className={`dash-alert dash-alert-${alert.type}`}>{alert.msg}</div>}

      <div className="dash-form-container">
        <h3>{editingId ? 'Edit Payroll' : 'Record Payroll'}</h3>
        <p style={{color:'var(--color-gold)',fontSize:'13px',marginBottom:'12px'}}>⚠️ Teacher rates are in Egyptian Pounds (L.E). Every 50 L.E = $1 USD internally.</p>
        <form onSubmit={handleSubmit}>
          <div className="dash-form-grid">
            <div className="dash-form-group">
              <label>Teacher</label>
              <select value={form.teacher_id} onChange={e => setForm({...form, teacher_id: e.target.value})} required>
                <option value="">Select Teacher</option>
                {teachers.map(t => <option key={t._id} value={t._id}>{t.full_name}</option>)}
              </select>
            </div>
            <div className="dash-form-group">
              <label>Month</label>
              <select value={form.month} onChange={e => setForm({...form, month: e.target.value})} required>
                <option value="">Select Month</option>
                {monthOptions.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            
            <div className="dash-form-group">
              <label>Teaching Hours (Auto-calculated)</label>
              <input type="number" step="0.01" value={form.time_hours} readOnly style={{opacity: 0.7}} />
            </div>
            <div className="dash-form-group">
              <label>Gross Salary (L.E)</label>
              <input type="number" step="0.01" value={form.total_salary} readOnly style={{opacity: 0.7}} />
            </div>
            <div className="dash-form-group">
              <label>Bonuses (L.E) (Editable)</label>
              <input type="number" step="0.01" value={form.bonuses} onChange={e => setForm({...form, bonuses: e.target.value})} />
            </div>
            <div className="dash-form-group">
              <label>Deductions (L.E) (Editable)</label>
              <input type="number" step="0.01" value={form.deductions} onChange={e => setForm({...form, deductions: e.target.value})} />
            </div>
            <div className="dash-form-group">
              <label>Net Salary (L.E) — Auto-converted to $ internally</label>
              <input type="number" step="0.01" value={form.net_salary} readOnly style={{opacity: 0.7, fontWeight: 'bold'}} />
            </div>
            <div className="dash-form-actions" style={{gridColumn: '1 / -1'}}>
              <Button type="submit" variant="primary">{editingId ? 'Update Payroll' : 'Record Payroll'}</Button>
              {editingId && <Button variant="outline" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancel</Button>}
            </div>
          </div>
        </form>
      </div>

      <div className="dash-table-container">
        <div className="dash-table-header"><h3>Payroll Records ({payments.length})</h3></div>
        <div style={{overflowX:'auto'}}>
          <table className="dash-table">
            <thead><tr><th>Teacher</th><th>Month</th><th>Hours</th><th>Gross (L.E)</th><th>Bonuses (L.E)</th><th>Deductions (L.E)</th><th>Net (L.E)</th><th>Net ($)</th><th>Actions</th></tr></thead>
            <tbody>
              {payments.map(p => (
                <tr key={p._id}>
                  <td>{p.teacher_name || p.teacher_id}</td>
                  <td>{p.month}</td>
                  <td>{p.time_hours}h</td>
                  <td>{p.total_salary} L.E</td>
                  <td>{p.bonuses || 0} L.E</td>
                  <td>{p.deductions || 0} L.E</td>
                  <td>{p.net_salary || 0} L.E</td>
                  <td style={{fontWeight: 'bold', color: 'var(--color-gold)'}}>${(parseFloat(p.net_salary || 0) / 50).toFixed(2)}</td>
                  <td><button className="dash-filter-btn" onClick={() => handleEdit(p)}>Edit</button></td>
                </tr>
              ))}
              {!payments.length && <tr><td colSpan="8" style={{textAlign:'center',color:'var(--color-text-muted)'}}>No payroll records</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
