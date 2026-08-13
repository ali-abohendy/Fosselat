import { useState, useEffect } from 'react';
import Button from '../../components/Button';

import API from '../../config.js';
const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('fossclat_token')}`,
});

const HOURLY_RATE = 8;       // Standard $8/hr
const ELITE_RATE = 7.2;      // Elite plan $7.2/hr (10% off)

const emptyForm = { family_id: '', month: '', total_due: '', amount_paid: '', remaining: '', status: 'unpaid', members: '' };

export default function AdminStudentPayments() {
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [alert, setAlert] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [memberStats, setMemberStats] = useState([]); // per-student session info

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
        const presentSessions = sessions.filter(s => s.status === 'present');

        // Total minutes this student actually attended
        const totalMins = presentSessions.reduce((acc, s) => {
          return acc + (Number(s.duration_minutes) || parseInt(s.duration) || 0);
        }, 0);
        const totalHours = totalMins / 60;

        // Hourly rate: $8 standard, $7.2 for elite
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
              <label>Family ID</label>
              <input list="family-ids" value={form.family_id}
                onChange={e => handleFamilyChange(e.target.value)}
                placeholder="Search or enter Family ID" required />
              <datalist id="family-ids">
                {familyIds.map(fid => <option key={fid} value={fid} />)}
              </datalist>
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
              <input type="number" step="0.01" value={form.amount_paid}
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
              <div className="dash-form-group" style={{gridColumn:'1 / -1'}}>
                <label>Family Members — Session Breakdown</label>
                <div style={{overflowX:'auto'}}>
                  <table className="dash-table" style={{fontSize:'13px'}}>
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
              {editingId && <Button variant="outline" onClick={() => { setEditingId(null); setForm(emptyForm); setMemberStats([]); }}>Cancel</Button>}
            </div>
          </div>
        </form>
      </div>

      <div className="dash-table-container">
        <div className="dash-table-header"><h3>Payment Records ({payments.length})</h3></div>
        <div style={{overflowX:'auto'}}>
          <table className="dash-table">
            <thead>
              <tr><th>Family ID</th><th>Members</th><th>Month</th><th>Total Due</th><th>Paid</th><th>Remaining</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p._id}>
                  <td style={{color:'var(--color-gold)',fontWeight:600}}>{p.family_id || '—'}</td>
                  <td>{p.members || '—'}</td>
                  <td>{p.month}</td>
                  <td>${p.total_due}</td>
                  <td>${p.amount_paid}</td>
                  <td>${p.remaining}</td>
                  <td><span className={`status-badge status-${p.status}`}>{p.status}</span></td>
                  <td><button className="dash-filter-btn" onClick={() => handleEdit(p)}>Edit</button></td>
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
