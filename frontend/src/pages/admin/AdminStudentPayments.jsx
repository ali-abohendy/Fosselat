import { useState, useEffect } from 'react';
import { Edit2, Trash2, X } from 'lucide-react';
import Button from '../../components/Button';
import SearchableSelect from '../../components/SearchableSelect';
import API from '../../config';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('fossclat_token')}`,
});

const emptyForm = { 
  family_id: '', 
  payment_amount: '', 
  start_date: new Date().toISOString().split('T')[0],
  students: []
};

export default function AdminStudentPayments() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [alert, setAlert] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [activeSub, setActiveSub] = useState(null);

  useEffect(() => {
    document.title = 'Student Subscriptions — Admin';
    fetchSubscriptions();
    fetch(`${API}/admin/students`, { headers: getHeaders() })
      .then(r => r.json()).then(d => { if (d.success) setStudents(d.data); }).catch(() => {});
  }, []);

  const fetchSubscriptions = () => {
    fetch(`${API}/admin/subscriptions`, { headers: getHeaders() })
      .then(r => r.json()).then(d => { 
        if (d.success) {
          const normalized = d.data.map(sub => {
            if (!sub.students) {
              sub.students = [{
                student_id: sub.student_id,
                rate: sub.student_rate,
                duration: sub.lesson_duration,
                lesson_charge: sub.lesson_charge,
                total_lessons: sub.total_lessons,
                used_lessons: sub.used_lessons,
                remaining_lessons: sub.remaining_lessons
              }];
            }
            return sub;
          });
          setSubscriptions(normalized); 
        } 
      }).catch(() => {});
  };

  const familyIds = [...new Set(students.map(s => s.student_id))].filter(Boolean);
  const getFamilyMembers = (fid) => students.filter(s => s.student_id === fid);

  const handleFamilyChange = async (fid) => {
    const fMems = getFamilyMembers(fid);
    const initialStudents = fMems.map(s => {
      const r = parseFloat(s.hourly_rate || 8);
      const d = parseFloat(s.class_duration || 30);
      return {
        student_id: s._id,
        name: s.full_name,
        rate: r,
        duration: d,
        charge: (r * (d / 60)).toFixed(2),
        lessons: 0
      };
    });

    let startDate = new Date().toISOString().split('T')[0];
    try {
      if (fid) {
        const res = await fetch(`${API}/admin/unbilled-sessions/${fid}`, { headers: getHeaders() });
        const d = await res.json();
        if (d.success && d.date) {
           startDate = d.date.split('T')[0];
        }
      }
    } catch(e) {}

    setForm({ 
      ...emptyForm, 
      family_id: fid, 
      students: initialStudents,
      start_date: startDate
    });
  };

  const handleStudentLessonChange = (student_id, lessons) => {
    const newStudents = form.students.map(s => {
      if (s.student_id === student_id) {
        return { ...s, lessons: parseInt(lessons) || 0 };
      }
      return s;
    });
    setForm(prev => ({ ...prev, students: newStudents }));
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
        setAlert({ type: 'success', msg: 'Family Subscription Cycle created successfully!' });
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

  const openEdit = (sub) => {
    setActiveSub(JSON.parse(JSON.stringify(sub))); // Deep copy
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const r = await fetch(`${API}/admin/subscriptions/${activeSub._id}`, { 
        method: 'PUT', 
        headers: getHeaders(), 
        body: JSON.stringify(activeSub) 
      });
      const d = await r.json();
      if (d.success) {
        setEditModalOpen(false);
        fetchSubscriptions();
      } else alert(d.message || 'Error updating subscription');
    } catch { alert('Server error'); }
  };

  return (
    <>
      <div className="dash-page-header">
        <h2>Family Subscriptions</h2>
        <p>Record new payments and track active subscription cycles</p>
      </div>
      {alert && <div className={`dash-alert dash-alert-${alert.type}`}>{alert.msg}</div>}

      <div className="dash-form-container">
        <h3>Record New Family Payment</h3>
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
              <label>Payment Amount ($)</label>
              <input type="number" step="0.01" min="1" value={form.payment_amount}
                onChange={e => setForm({...form, payment_amount: e.target.value})} required disabled={!form.family_id} />
            </div>

            <div className="dash-form-group">
              <label>Cycle Start Date</label>
              <input type="date" value={form.start_date}
                onChange={e => setForm({...form, start_date: e.target.value})} required disabled={!form.family_id} />
            </div>

            {form.students.length > 0 && (
              <div className="dash-form-group" style={{ gridColumn: '1 / -1', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px' }}>
                <h4 style={{ marginBottom: '16px', color: 'var(--color-gold)' }}>Allocate Lessons</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                  {form.students.map(st => (
                    <div key={st.student_id} style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--color-cream)', marginBottom: '8px' }}>{st.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
                        Rate: ${st.rate}/hr | Dur: {st.duration}m | Charge/lesson: ${st.charge}
                      </div>
                      <label style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}>Lessons Allocated</label>
                      <input 
                        type="number" min="0" value={st.lessons}
                        onChange={e => handleStudentLessonChange(st.student_id, e.target.value)}
                        style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'var(--color-white)' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="dash-form-actions" style={{gridColumn:'1 / -1'}}>
              <Button type="submit" variant="primary" disabled={!form.family_id}>Record Payment & Cycle</Button>
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
                <th>Start Date</th>
                <th>Total Paid</th>
                <th>Family Balance</th>
                <th>Students & Lessons</th>
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
                .map(sub => (
                    <tr key={sub._id}>
                      <td style={{color:'var(--color-gold)',fontWeight:600}}>{sub.family_id}</td>
                      <td>{sub.start_date}</td>
                      <td style={{fontWeight: 700}}>${sub.payment_amount}</td>
                      <td style={{color: sub.remaining_balance < 0 ? '#ef4444' : 'inherit'}}>${sub.remaining_balance.toFixed(2)}</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {sub.students.map(st => {
                            const stObj = students.find(s => s._id === st.student_id);
                            const name = stObj ? stObj.full_name : 'Unknown';
                            return (
                              <div key={st.student_id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', background: 'rgba(255,255,255,0.02)', padding: '6px', borderRadius: '4px' }}>
                                <div style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ width: '60px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden', marginBottom: '4px' }}>
                                    <div style={{
                                      height: '100%', 
                                      background: st.remaining_lessons <= 0 ? '#4ade80' : 'var(--color-gold)',
                                      width: `${Math.min((st.used_lessons / (st.total_lessons || 1)) * 100, 100)}%`
                                    }} />
                                  </div>
                                  <span style={{ color: 'var(--color-text-muted)', fontSize: '10px' }}>{st.used_lessons}/{st.total_lessons} lessons</span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge status-${sub.status === 'active' ? 'active' : 'inactive'}`}>
                          {sub.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button onClick={() => openEdit(sub)} style={{ background: 'transparent', border: 'none', color: '#60a5fa', cursor: 'pointer', padding: '6px', borderRadius: '4px' }} title="Edit">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(sub._id)} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: '6px', borderRadius: '4px' }} title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
              )}
              {!subscriptions.length && <tr><td colSpan="7" style={{textAlign:'center',color:'var(--color-text-muted)'}}>No subscription cycles found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {editModalOpen && activeSub && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{
            background: 'var(--color-bg)', border: '1px solid rgba(200,167,99,0.2)',
            borderRadius: '12px', width: '90%', maxWidth: '600px', maxHeight: '90vh',
            display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ padding: '20px', borderBottom: '1px solid rgba(200,167,99,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, color: 'var(--color-white)', fontSize: '18px' }}>Edit Subscription</h3>
                <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: '13px' }}>Family: {activeSub.family_id}</p>
              </div>
              <button onClick={() => setEditModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} style={{ padding: '20px', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: '1fr 1fr' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--color-cream)' }}>Payment Amount ($)</label>
                  <input type="number" step="0.01" value={activeSub.payment_amount} onChange={e => setActiveSub({...activeSub, payment_amount: parseFloat(e.target.value) || 0})} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'var(--color-white)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--color-cream)' }}>Start Date</label>
                  <input type="date" value={activeSub.start_date} onChange={e => setActiveSub({...activeSub, start_date: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'var(--color-white)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--color-cream)' }}>Status</label>
                  <select value={activeSub.status} onChange={e => setActiveSub({...activeSub, status: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'var(--color-white)' }}>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <h4 style={{ margin: '24px 0 12px', color: 'var(--color-gold)' }}>Student Allocations</h4>
              <div style={{ display: 'grid', gap: '12px' }}>
                {activeSub.students.map((st, idx) => {
                  const stObj = students.find(s => s._id === st.student_id);
                  const name = stObj ? stObj.full_name : 'Unknown';
                  return (
                    <div key={st.student_id} style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', color: 'var(--color-cream)' }}>{name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Used: {st.used_lessons} | Remaining: {st.remaining_lessons}</div>
                      </div>
                      <div style={{ width: '100px' }}>
                        <label style={{ fontSize: '11px', display: 'block', marginBottom: '4px' }}>Total Lessons</label>
                        <input type="number" min="0" value={st.total_lessons} onChange={e => {
                          const newTotal = parseInt(e.target.value) || 0;
                          const newStudents = [...activeSub.students];
                          newStudents[idx].total_lessons = newTotal;
                          newStudents[idx].remaining_lessons = newTotal - newStudents[idx].used_lessons;
                          setActiveSub({...activeSub, students: newStudents});
                        }} style={{ width: '100%', padding: '6px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: 'var(--color-white)' }} />
                      </div>
                    </div>
                  )
                })}
              </div>

              <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
