import { useState, useEffect } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import Button from '../../components/Button';
import SearchableSelect from '../../components/SearchableSelect';
import API from '../../config';
const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('fossclat_token')}`,
});

const HOURLY_RATE = 10;       // Standard $10/hr
const ELITE_RATE = 9;      // Elite plan $9/hr (10% off)

const emptyForm = { family_id: '', month: '', total_due: '', amount_paid: '', remaining: '', status: 'unpaid', members: '' };

export default function AdminStudentPayments() {
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [alert, setAlert] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [memberStats, setMemberStats] = useState([]); // per-student session info
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMonth, setFilterMonth] = useState('');

  const getMonths = () => {
    const months = [];
    const d = new Date();
    for (let i = 0; i < 12; i++) {
      months.push(new Date(d.getFullYear(), d.getMonth() - i, 1)
        .toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
    }
    return months;
  };
  const monthOptions = getMonths();

  const fetchPayments = () => {
    fetch(`${API}/admin/payments/students`, { headers: getHeaders() })
      .then(r => r.json()).then(d => { if (d.success) setPayments(d.data); }).catch(() => {});
  };

  const fetchSessionsForStudent = async (studentId, monthPrefix) => {
    try {
      const r = await fetch(`${API}/admin/attendance?student_id=${studentId}&month=${monthPrefix}`, { headers: getHeaders() });
      const d = await r.json();
      if (d.success) return d.data;
      return [];
    } catch { return []; }
  };

  useEffect(() => {
    document.title = 'Student Payments — Admin';
    fetchPayments();
    fetch(`${API}/admin/students`, { headers: getHeaders() })
      .then(r => r.json()).then(d => { if (d.success) setStudents(d.data); }).catch(() => {});
  }, []);

  const familyIds = [...new Set(students.map(s => s.student_id))].filter(Boolean);
  const getFamilyMembers = (fid) => students.filter(s => s.student_id === fid);

  const getMonthPrefix = (monthStr) => {
    const d = new Date(monthStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  const handleFamilyChange = (fid) => {
    const members = getFamilyMembers(fid);
    setForm(prev => ({ ...prev, family_id: fid, members: members.map(m => m.full_name).join(', ') }));
    setMemberStats([]);
  };

  // Recalculate when family or month changes
  useEffect(() => {
    const calc = async () => {
      if (!form.family_id || !form.month) return;
      const members = getFamilyMembers(form.family_id);
      const prefix = getMonthPrefix(form.month);

      let totalDue = 0;
      const stats = [];

      for (const m of members) {
        const sessions = await fetchSessionsForStudent(m._id, prefix);
        const presentSessions = sessions.filter(s => s.status === 'present' || s.status === 'absent');

        // Total minutes this student actually attended
        const totalMins = presentSessions.reduce((acc, s) => {
          return acc + (Number(s.duration_minutes) || parseInt(s.duration) || 0);
        }, 0);
        const totalHours = totalMins / 60;

        // Hourly rate: $10 standard, $9 for elite
        const rate = m.plan === 'elite' ? ELITE_RATE : HOURLY_RATE;
        const due = totalHours * rate;
        totalDue += due;

        stats.push({
          name: m.full_name,
          plan: m.plan || '—',
          classDuration: m.class_duration ? `${m.class_duration} min` : '—',
          sessions: presentSessions.length,
          totalMins,
          totalHours: totalHours.toFixed(2),
          rate,
          due: due.toFixed(2),
        });
      }

      setMemberStats(stats);

      setForm(prev => {
        const d = parseFloat(totalDue.toFixed(2));
        const p = parseFloat(prev.amount_paid) || 0;
        const rem = d - p;
        let st = 'unpaid';
        if (d === 0 && p === 0) st = 'paid';
        else if (p === 0) st = 'unpaid';
        else if (rem <= 0) st = p > d ? 'credit' : 'paid';
        else st = 'partial';
        return { ...prev, total_due: d.toFixed(2), remaining: rem.toFixed(2), status: st };
      });
    };
    calc();
  }, [form.family_id, form.month]);

  const handlePaidChange = (paid) => {
    const d = parseFloat(form.total_due) || 0;
    const p = parseFloat(paid) || 0;
    const rem = d - p;
    let st = 'unpaid';
    if (d === 0 && p === 0) st = 'paid';
    else if (p === 0) st = 'unpaid';
    else if (rem <= 0) st = p > d ? 'credit' : 'paid';
    else st = 'partial';
    setForm(prev => ({ ...prev, amount_paid: paid, remaining: rem.toFixed(2), status: st }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setAlert(null);
    try {
      const url = editingId ? `${API}/admin/payments/students/${editingId}` : `${API}/admin/payments/students`;
      const method = editingId ? 'PUT' : 'POST';
      const r = await fetch(url, { method, headers: getHeaders(), body: JSON.stringify(form) });
      const d = await r.json();
      if (d.success) {
        setAlert({ type: 'success', msg: editingId ? 'Payment updated!' : 'Payment recorded!' });
        setForm(emptyForm); setEditingId(null); setMemberStats([]);
        fetchPayments();
      } else setAlert({ type: 'error', msg: d.message || 'Error' });
    } catch { setAlert({ type: 'error', msg: 'Server error' }); }
  };

  const handleEdit = (p) => {
    setEditingId(p._id);
    setForm({ family_id: p.family_id || '', month: p.month || '', members: p.members || '',
      total_due: p.total_due || '', amount_paid: p.amount_paid || '',
      remaining: p.remaining || '', status: p.status || 'unpaid' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to clear this payment record?')) return;
    try {
      const r = await fetch(`${API}/admin/payments/students/${id}`, { method: 'DELETE', headers: getHeaders() });
      const d = await r.json();
      if (d.success) fetchPayments();
      else setAlert({ type: 'error', msg: d.message || 'Error clearing payment' });
    } catch { setAlert({ type: 'error', msg: 'Server error' }); }
  };

  return (
    <>
      <div className="dash-page-header">
        <h2>Student Payment Sheet</h2>
        <p>Record and track family payments</p>
      </div>
      {alert && <div className={`dash-alert dash-alert-${alert.type}`}>{alert.msg}</div>}

      <div className="dash-form-container">
        <h3>{editingId ? 'Edit Payment' : 'Record Payment'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="dash-form-grid">

            <div className="dash-form-group">
              <SearchableSelect
                label="Family ID"
                options={familyIds.map(id => ({ value: id, label: id }))}
                value={form.family_id}
                onChange={val => handleFamilyChange(val)}
                placeholder="Search or select Family ID"
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
              <label>Amount Paid ($)</label>
              <input type="number" step="0.01" min="0" value={form.amount_paid}
                onChange={e => handlePaidChange(e.target.value)} required />
            </div>

            <div className="dash-form-group">
              <label>Total Due ($)</label>
              <input type="number" step="0.01" value={form.total_due} readOnly style={{opacity:0.7}} />
            </div>

            <div className="dash-form-group">
              <label>Remaining ($)</label>
              <input type="number" step="0.01" value={form.remaining} readOnly style={{opacity:0.7}} />
            </div>

            <div className="dash-form-group">
              <label>Status</label>
              <input value={form.status.toUpperCase()} readOnly style={{opacity:0.7, fontWeight:'bold'}} />
            </div>

            {/* Per-student breakdown table */}
            {memberStats.length > 0 && (
              <div className="dash-form-group" style={{gridColumn:'1 / -1', maxWidth: '100%'}}>
                <label>Family Members — Session Breakdown</label>
                <div style={{overflowX:'auto', width:'100%', maxWidth:'100%'}}>
                  <table className="dash-table" style={{fontSize:'13px', width:'100%'}}>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Plan</th>
                        <th>Class Duration</th>
                        <th>Sessions Taken</th>
                        <th>Total Duration</th>
                        <th>Rate ($/hr)</th>
                        <th>Due ($)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {memberStats.map((m, i) => (
                        <tr key={i}>
                          <td>{m.name}</td>
                          <td>{m.plan}</td>
                          <td>{m.classDuration}</td>
                          <td style={{textAlign:'center'}}>{m.sessions}</td>
                          <td style={{color:'var(--color-gold)', fontWeight:600}}>
                            {Math.floor(m.totalMins / 60)}h {m.totalMins % 60}m
                          </td>
                          <td>${m.rate}{m.plan === 'elite' ? ' (elite)' : ''}</td>
                          <td style={{fontWeight:700, color:'var(--color-gold)'}}>${m.due}</td>
                        </tr>
                      ))}
                      <tr style={{borderTop:'2px solid rgba(200,167,99,0.4)'}}>
                        <td colSpan={6} style={{textAlign:'right', fontWeight:700, paddingRight:'16px'}}>Total Due</td>
                        <td style={{fontWeight:700, color:'var(--color-gold)', fontSize:'15px'}}>${form.total_due}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="dash-form-actions" style={{gridColumn:'1 / -1'}}>
              <Button type="submit" variant="primary">{editingId ? 'Update Payment' : 'Record Payment'}</Button>
              {editingId && <Button type="button" variant="outline" onClick={() => { setEditingId(null); setForm(emptyForm); setMemberStats([]); }}>Cancel</Button>}
              {!editingId && <Button type="button" variant="outline" onClick={() => { setForm(emptyForm); setMemberStats([]); }}>Clear</Button>}
            </div>
          </div>
        </form>
      </div>

      <div className="dash-table-container">
        <div className="dash-table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <h3>Payment Records ({payments.length})</h3>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search by ID or name..."
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
            <thead>
              <tr><th>Family ID</th><th>Members</th><th>Month</th><th>Total Due</th><th>Paid</th><th>Remaining</th><th>Status</th><th style={{textAlign: 'center'}}>Actions</th></tr>
            </thead>
            <tbody>
              {payments
                .filter(p => {
                  if (filterMonth && p.month !== filterMonth) return false;
                  if (!searchQuery.trim()) return true;
                  const q = searchQuery.toLowerCase();
                  return (
                    (p.family_id || '').toLowerCase().includes(q) ||
                    (p.members || '').toLowerCase().includes(q)
                  );
                })
                .map(p => (
                <tr key={p._id}>
                  <td style={{color:'var(--color-gold)',fontWeight:600}}>{p.family_id || '—'}</td>
                  <td>{p.members || '—'}</td>
                  <td>{p.month}</td>
                  <td>${p.total_due}</td>
                  <td>${p.amount_paid}</td>
                  <td>${p.remaining}</td>
                  <td><span className={`status-badge status-${p.status}`}>{p.status}</span></td>
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
              {!payments.length && <tr><td colSpan="8" style={{textAlign:'center',color:'var(--color-text-muted)'}}>No payments recorded</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
