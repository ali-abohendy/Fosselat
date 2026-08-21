import { useState, useEffect } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import Button from '../../components/Button';
import SearchableSelect from '../../components/SearchableSelect';
import API from '../../config';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMonth, setFilterMonth] = useState('');

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
          const presentSessions = teacherSessions.filter(s => s.status === 'present' || s.status === 'absent');
          
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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to clear this payroll record?')) return;
    try {
      const r = await fetch(`${API}/admin/payments/teachers/${id}`, { method: 'DELETE', headers: getHeaders() });
      const d = await r.json();
      if (d.success) fetchPayments();
      else setAlert({ type: 'error', msg: d.message || 'Error clearing payroll' });
    } catch { setAlert({ type: 'error', msg: 'Server error' }); }
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
              <SearchableSelect
                label="Teacher"
                options={teachers.map(t => ({ value: t._id, label: t.full_name }))}
                value={form.teacher_id}
                onChange={val => setForm({...form, teacher_id: val})}
                placeholder="Search or select Teacher"
                required
              />
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
              <input type="number" step="0.01" min="0" value={form.bonuses} onChange={e => setForm({...form, bonuses: e.target.value})} />
            </div>
            <div className="dash-form-group">
              <label>Deductions (L.E) (Editable)</label>
              <input type="number" step="0.01" min="0" value={form.deductions} onChange={e => setForm({...form, deductions: e.target.value})} />
            </div>
            <div className="dash-form-group">
              <label>Net Salary (L.E) — Auto-converted to $ internally</label>
              <input type="number" step="0.01" value={form.net_salary} readOnly style={{opacity: 0.7, fontWeight: 'bold'}} />
            </div>
            <div className="dash-form-actions" style={{gridColumn: '1 / -1'}}>
              <Button type="submit" variant="primary">{editingId ? 'Update Payroll' : 'Record Payroll'}</Button>
              {editingId && <Button type="button" variant="outline" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancel</Button>}
              {!editingId && <Button type="button" variant="outline" onClick={() => { setForm(emptyForm); }}>Clear</Button>}
            </div>
          </div>
        </form>
      </div>

      <div className="dash-table-container">
        <div className="dash-table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <h3>Payroll Records ({payments.length})</h3>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search by teacher name..."
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
                width: 'auto',
                flex: '1 1 auto',
                outline: 'none',
                fontFamily: 'var(--font-family)',
              }}
            />
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              style={{ padding: '8px 12px', background: 'transparent', border: '1px solid rgba(200,167,99,0.3)', color: 'var(--color-cream)', borderRadius: '6px', minWidth: '150px', width: 'auto', flex: '1 1 auto' }}
            >
              <option value="" style={{ color: '#000' }}>All Months</option>
              {monthOptions.map(m => <option key={m} value={m} style={{ color: '#000' }}>{m}</option>)}
            </select>
          </div>
        </div>
        <div style={{overflowX:'auto'}}>
          <table className="dash-table">
            <thead><tr><th>Teacher</th><th>Month</th><th>Hours</th><th>Gross (L.E)</th><th>Bonuses (L.E)</th><th>Deductions (L.E)</th><th>Net (L.E)</th><th>Net ($)</th><th style={{textAlign: 'center'}}>Actions</th></tr></thead>
            <tbody>
              {payments
                .filter(p => {
                  if (filterMonth && p.month !== filterMonth) return false;
                  if (!searchQuery.trim()) return true;
                  const q = searchQuery.toLowerCase();
                  return (p.teacher_name || p.teacher_id || '').toLowerCase().includes(q);
                })
                .map(p => (
                <tr key={p._id}>
                  <td>{p.teacher_name || p.teacher_id}</td>
                  <td>{p.month}</td>
                  <td>{p.time_hours}h</td>
                  <td>{p.total_salary} L.E</td>
                  <td>{p.bonuses || 0} L.E</td>
                  <td>{p.deductions || 0} L.E</td>
                  <td>{p.net_salary || 0} L.E</td>
                  <td style={{fontWeight: 'bold', color: 'var(--color-gold)'}}>${(parseFloat(p.net_salary || 0) / 50).toFixed(2)}</td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button onClick={() => handleEdit(p)} style={{ background: 'transparent', border: 'none', color: 'var(--color-gold)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', borderRadius: '4px', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background='rgba(200,167,99,0.1)'} onMouseLeave={e => e.currentTarget.style.background='transparent'} title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(p._id)} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', borderRadius: '4px', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background='rgba(248,113,113,0.1)'} onMouseLeave={e => e.currentTarget.style.background='transparent'} title="Clear">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!payments.length && <tr><td colSpan="9" style={{textAlign:'center',color:'var(--color-text-muted)'}}>No payroll records</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
