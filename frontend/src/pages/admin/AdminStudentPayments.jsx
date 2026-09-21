import { useState, useEffect } from 'react';
import { Edit2, Trash2, FileText, X } from 'lucide-react';
import Button from '../../components/Button';
import SearchableSelect from '../../components/SearchableSelect';
import API from '../../config';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('fossclat_token')}`,
});

const emptyForm = { 
  family_id: '', 
  student_id: '', 
  payment_amount: '', 
  student_rate: '', 
  lesson_duration: '',
  start_date: new Date().toISOString().split('T')[0]
};

export default function AdminStudentPayments() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [alert, setAlert] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Ledger Modal State
  const [ledgerModalOpen, setLedgerModalOpen] = useState(false);
  const [activeLedger, setActiveLedger] = useState(null);
  const [activeLedgerData, setActiveLedgerData] = useState([]);

  useEffect(() => {
    document.title = 'Student Subscriptions — Admin';
    fetchSubscriptions();
    fetch(`${API}/admin/students`, { headers: getHeaders() })
      .then(r => r.json()).then(d => { if (d.success) setStudents(d.data); }).catch(() => {});
  }, []);

  const fetchSubscriptions = () => {
    fetch(`${API}/admin/subscriptions`, { headers: getHeaders() })
      .then(r => r.json()).then(d => { if (d.success) setSubscriptions(d.data); }).catch(() => {});
  };

  const familyIds = [...new Set(students.map(s => s.student_id))].filter(Boolean);
  const getFamilyMembers = (fid) => students.filter(s => s.student_id === fid);
  const familyMembers = form.family_id ? getFamilyMembers(form.family_id) : [];

  const handleFamilyChange = (fid) => {
    setForm({ ...emptyForm, family_id: fid });
  };

  const handleStudentChange = (sid) => {
    const student = students.find(s => s._id === sid);
    if (student) {
      setForm(prev => ({
        ...prev,
        student_id: sid,
        student_rate: student.hourly_rate || 8,
        lesson_duration: student.class_duration || 30,
      }));
    } else {
      setForm(prev => ({ ...prev, student_id: sid }));
    }
  };

  const calculatedLessons = () => {
    const p = parseFloat(form.payment_amount);
    const r = parseFloat(form.student_rate);
    const d = parseFloat(form.lesson_duration);
    if (!p || !r || !d) return 0;
    const charge = r * (d / 60);
    if (charge <= 0) return 0;
    return Math.floor(p / charge);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setAlert(null);
    try {
      const r = await fetch(`${API}/admin/subscriptions`, { 
        method: 'POST', 
        headers: getHeaders(), 
        body: JSON.stringify(form) 
      });
      const d = await r.json();
      if (d.success) {
        setAlert({ type: 'success', msg: 'Subscription Cycle created successfully!' });
        setForm(emptyForm);
        fetchSubscriptions();
      } else setAlert({ type: 'error', msg: d.message || 'Error' });
    } catch { setAlert({ type: 'error', msg: 'Server error' }); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subscription cycle?')) return;
    try {
      const r = await fetch(`${API}/admin/subscriptions/${id}`, { method: 'DELETE', headers: getHeaders() });
      const d = await r.json();
      if (d.success) fetchSubscriptions();
      else setAlert({ type: 'error', msg: d.message || 'Error clearing record' });
    } catch { setAlert({ type: 'error', msg: 'Server error' }); }
  };

  const openLedger = async (sub) => {
    setActiveLedger(sub);
    setLedgerModalOpen(true);
    try {
      const r = await fetch(`${API}/admin/subscriptions/${sub._id}/ledger`, { headers: getHeaders() });
      const d = await r.json();
      if (d.success) setActiveLedgerData(d.data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <div className="dash-page-header">
        <h2>Student Subscriptions</h2>
        <p>Record new payments and track active subscription cycles</p>
      </div>
      {alert && <div className={`dash-alert dash-alert-${alert.type}`}>{alert.msg}</div>}

      <div className="dash-form-container">
        <h3>Record New Payment (Create Cycle)</h3>
        <form onSubmit={handleSubmit}>
          <div className="dash-form-grid">

            <div className="dash-form-group">
              <SearchableSelect
                label="Family ID"
                options={familyIds.map(id => ({ value: id, label: id }))}
                value={form.family_id}
                onChange={val => handleFamilyChange(val)}
                placeholder="Search Family ID"
                required
              />
            </div>

            <div className="dash-form-group">
              <label>Student</label>
              <select value={form.student_id} onChange={e => handleStudentChange(e.target.value)} required disabled={!form.family_id}>
                <option value="">Select Student</option>
                {familyMembers.map(m => <option key={m._id} value={m._id}>{m.full_name}</option>)}
              </select>
            </div>

            <div className="dash-form-group">
              <label>Payment Amount ($)</label>
              <input type="number" step="0.01" min="1" value={form.payment_amount}
                onChange={e => setForm({...form, payment_amount: e.target.value})} required />
            </div>

            <div className="dash-form-group">
              <label>Student Rate ($/hr)</label>
              <input type="number" step="0.01" min="0.1" value={form.student_rate}
                onChange={e => setForm({...form, student_rate: e.target.value})} required />
            </div>

            <div className="dash-form-group">
              <label>Lesson Duration (minutes)</label>
              <select value={form.lesson_duration} onChange={e => setForm({...form, lesson_duration: e.target.value})} required>
                <option value="">Select Duration</option>
                <option value="30">30 min</option>
                <option value="45">45 min</option>
                <option value="60">60 min</option>
                <option value="90">90 min</option>
                <option value="120">120 min</option>
              </select>
            </div>

            <div className="dash-form-group">
              <label>Calculated Entitlement</label>
              <div style={{ padding: '10px 14px', background: 'rgba(200,167,99,0.1)', borderRadius: '8px', color: 'var(--color-gold)', fontWeight: 600 }}>
                {calculatedLessons()} Lessons
              </div>
            </div>

            <div className="dash-form-actions" style={{gridColumn:'1 / -1'}}>
              <Button type="submit" variant="primary">Record Payment</Button>
            </div>
          </div>
        </form>
      </div>

      <div className="dash-table-container">
        <div className="dash-table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <h3>Subscription Cycles ({subscriptions.length})</h3>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search by Family ID..."
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
              }}
            />
          </div>
        </div>
        <div style={{overflowX:'auto'}}>
          <table className="dash-table">
            <thead>
              <tr>
                <th>Family ID</th>
                <th>Student</th>
                <th>Start Date</th>
                <th>Payment</th>
                <th>Rate / Dur</th>
                <th>Lessons (Used/Tot)</th>
                <th>Balance</th>
                <th>Status</th>
                <th style={{textAlign: 'center'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions
                .filter(s => {
                  if (!searchQuery.trim()) return true;
                  const q = searchQuery.toLowerCase();
                  return (s.family_id || '').toLowerCase().includes(q);
                })
                .map(sub => {
                  const st = students.find(s => s._id === sub.student_id);
                  const stName = st ? st.full_name : 'Unknown';
                  return (
                    <tr key={sub._id}>
                      <td style={{color:'var(--color-gold)',fontWeight:600}}>{sub.family_id}</td>
                      <td>{stName}</td>
                      <td>{sub.start_date}</td>
                      <td style={{fontWeight: 700}}>${sub.payment_amount}</td>
                      <td style={{fontSize: '12px'}}>${sub.student_rate}/hr <br/> {sub.lesson_duration}m</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ 
                            width: '100%', maxWidth: '80px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' 
                          }}>
                            <div style={{
                              height: '100%', 
                              background: sub.status === 'completed' ? '#4ade80' : 'var(--color-gold)',
                              width: `${(sub.used_lessons / sub.total_lessons) * 100}%`
                            }} />
                          </div>
                          <span style={{fontSize: '11px', color: 'var(--color-text-muted)'}}>
                            {sub.used_lessons} / {sub.total_lessons}
                          </span>
                        </div>
                      </td>
                      <td style={{color: sub.remaining_balance < 0 ? '#ef4444' : 'inherit'}}>${sub.remaining_balance.toFixed(2)}</td>
                      <td>
                        <span className={`status-badge status-${sub.status === 'active' ? 'active' : 'inactive'}`}>
                          {sub.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button onClick={() => openLedger(sub)} style={{ background: 'transparent', border: 'none', color: '#60a5fa', cursor: 'pointer', padding: '6px', borderRadius: '4px' }} title="View Ledger">
                            <FileText size={16} />
                          </button>
                          <button onClick={() => handleDelete(sub._id)} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: '6px', borderRadius: '4px' }} title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
              })}
              {!subscriptions.length && <tr><td colSpan="9" style={{textAlign:'center',color:'var(--color-text-muted)'}}>No subscription cycles found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {ledgerModalOpen && activeLedger && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{
            background: 'var(--color-bg)', border: '1px solid rgba(200,167,99,0.2)',
            borderRadius: '12px', width: '90%', maxWidth: '600px', maxHeight: '80vh',
            display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ padding: '20px', borderBottom: '1px solid rgba(200,167,99,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, color: 'var(--color-white)', fontSize: '18px' }}>Ledger</h3>
                <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: '13px' }}>
                  Student: {students.find(s => s._id === activeLedger.student_id)?.full_name || 'Unknown'} | Start: {activeLedger.start_date}
                </p>
              </div>
              <button onClick={() => setLedgerModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: '20px', overflowY: 'auto' }}>
              <table className="dash-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Transaction</th>
                    <th>Charge</th>
                    <th>Payment</th>
                    <th>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {activeLedgerData.map((row, idx) => (
                    <tr key={idx}>
                      <td>{row.date}</td>
                      <td>{row.transaction}</td>
                      <td style={{ color: '#f87171' }}>{row.charge > 0 ? `-$${row.charge.toFixed(2)}` : '—'}</td>
                      <td style={{ color: '#4ade80' }}>{row.payment > 0 ? `+$${row.payment.toFixed(2)}` : '—'}</td>
                      <td style={{ fontWeight: 600 }}>${row.balance.toFixed(2)}</td>
                    </tr>
                  ))}
                  {activeLedgerData.length === 0 && (
                    <tr><td colSpan="5" style={{textAlign: 'center'}}>Loading ledger...</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
