import { useState, useEffect } from 'react';
import Button from '../../components/Button';
import SearchableSelect from '../../components/SearchableSelect';
import { Edit2, Trash2 } from 'lucide-react';
import API from '../../config';
import { localToUTC, utcToLocal } from '../../utils/timezones';
const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('fossclat_token')}`,
});

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function AdminSchedule() {
  const [slots, setSlots] = useState([]);
  const [scheduled, setScheduled] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ teacher_id: '', student_id: '', day: '', start_time: '', end_time: '', duration: '60 min' });
  const [alert, setAlert] = useState(null);
  const [filterTeacher, setFilterTeacher] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDay, setActiveDay] = useState('Monday');
  const [conflictWarning, setConflictWarning] = useState('');
  const [editingSessionId, setEditingSessionId] = useState(null);

  const fetchData = () => {
    fetch(`${API}/admin/schedule`, { headers: getHeaders() })
      .then(r => r.json()).then(d => { if (d.success) {
            const rawSlots = d.data.slots || [];
            const localSlots = rawSlots.map(s => {
                const { localDay, localTime: lStart } = utcToLocal(s.day, s.start_time);
                const { localTime: lEnd } = utcToLocal(s.day, s.end_time);
                return { ...s, day: localDay, start_time: lStart, end_time: lEnd };
            });
            setSlots(localSlots);
            
            const rawSched = d.data.scheduled || [];
            const localSched = rawSched.map(s => {
                const { localDay, localTime: lStart } = utcToLocal(s.day, s.start_time);
                const { localTime: lEnd } = utcToLocal(s.day, s.end_time);
                return { ...s, day: localDay, start_time: lStart, end_time: lEnd };
            });
            setScheduled(localSched);
          }}).catch(() => {});
    fetch(`${API}/admin/students`, { headers: getHeaders() })
      .then(r => r.json()).then(d => { if (d.success) setStudents(d.data); }).catch(() => {});
    fetch(`${API}/admin/teachers`, { headers: getHeaders() })
      .then(r => r.json()).then(d => { if (d.success) setTeachers(d.data); }).catch(() => {});
  };

  useEffect(() => { document.title = 'Schedule — Admin'; fetchData(); }, []);

  // Fetch student slots & auto-fill duration when student selected
  useEffect(() => {
    if (form.student_id) {
      const student = students.find(s => s._id === form.student_id);
      if (student && student.class_duration) {
        let dur = String(student.class_duration).trim();
        if (!dur.includes('min')) dur = `${dur} min`;
        setForm(prev => ({ ...prev, duration: dur }));
      }
    }
  }, [form.student_id, students]);

  // Auto-calculate end_time
  useEffect(() => {
    if (form.start_time && form.duration) {
      const durationMins = parseInt(form.duration.split(' ')[0], 10) || 60;
      const [h, m] = form.start_time.split(':').map(Number);
      const endMins = h * 60 + m + durationMins;
      const endH = Math.floor(endMins / 60) % 24;
      const endM = endMins % 60;
      setForm(prev => ({ ...prev, end_time: `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}` }));
    }
  }, [form.start_time, form.duration]);

  const filteredTeacherSlots = filterTeacher ? slots.filter(s => s.teacher_id === filterTeacher) : slots;
  
  const groupedTeacherSlots = DAYS.reduce((acc, day) => {
    acc[day] = filteredTeacherSlots.filter(s => s.day === day);
    return acc;
  }, {});

  const handleSlotClick = (slot) => {
    setForm(prev => ({
      ...prev,
      teacher_id: slot.teacher_id,
      day: slot.day,
      start_time: slot.start_time,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSessionId) {
        const res = await fetch(`${API}/admin/schedule/${editingSessionId}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify({
          ...form,
          day: localToUTC(form.day, form.start_time).utcDay,
          start_time: localToUTC(form.day, form.start_time).utcTime,
          end_time: localToUTC(form.day, form.end_time).utcTime,
        })
        });
        const json = await res.json();
        if (json.success) {
          fetchData();
          setEditingSessionId(null);
          setForm({ teacher_id: '', student_id: '', day: '', start_time: '', end_time: '', duration: '60 min' });
          setConflictWarning('');
          setAlert({ type: 'success', msg: 'Session updated!' });
        }
      } else {
        const res = await fetch(`${API}/admin/schedule`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({
          ...form,
          day: localToUTC(form.day, form.start_time).utcDay,
          start_time: localToUTC(form.day, form.start_time).utcTime,
          end_time: localToUTC(form.day, form.end_time).utcTime,
        })
        });
        const json = await res.json();
        if (json.success) {
          fetchData();
          setForm({ teacher_id: '', student_id: '', day: '', start_time: '', end_time: '', duration: '60 min' });
          setConflictWarning('');
          setAlert({ type: 'success', msg: 'Session scheduled!' });
        }
      }
    } catch (err) {
      setAlert({ type: 'error', msg: 'Server error' });
    }
  };

  const handleEdit = (session) => {
    setEditingSessionId(session._id);
    setForm({
      teacher_id: session.teacher_id || '',
      student_id: session.student_id || '',
      day: session.day || '',
      start_time: session.start_time || '',
      end_time: session.end_time || '',
      duration: session.duration || '60 min'
    });
    setConflictWarning('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this scheduled session?')) return;
    try {
      const res = await fetch(`${API}/admin/schedule/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const json = await res.json();
      if (json.success) {
        setScheduled(scheduled.filter(s => s._id !== id));
        setAlert({ type: 'success', msg: 'Session deleted' });
      }
    } catch (err) {
      setAlert({ type: 'error', msg: 'Server error' });
    }
  };

  return (
    <>
      <div className="dash-page-header">
        <h2>Session Scheduling</h2>
        <p>Assign students to teachers based on available time slots</p>
      </div>
      {alert && <div className={`dash-alert dash-alert-${alert.type}`}>{alert.msg}</div>}

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {/* Teacher Slot Viewer */}
        <div className="dash-table-container" style={{ flex: 1, minWidth: '300px' }}>
          <div className="dash-table-header">
            <h3>Teacher Availability</h3>
            <select className="dash-filter-btn" value={filterTeacher} onChange={e => setFilterTeacher(e.target.value)}>
              <option value="">All Teachers</option>
              {teachers.map(t => <option key={t._id} value={t._id}>{t.full_name}</option>)}
            </select>
          </div>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Tabs for Days */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderBottom: '1px solid rgba(200,167,99,0.15)', paddingBottom: '16px' }}>
              {DAYS.map(day => {
                const count = groupedTeacherSlots[day]?.length || 0;
                return (
                  <button
                    key={day}
                    onClick={() => setActiveDay(day)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      background: activeDay === day ? 'var(--color-gold)' : 'rgba(200,167,99,0.05)',
                      color: activeDay === day ? 'var(--color-bg)' : 'var(--color-cream)',
                      border: activeDay === day ? 'none' : '1px solid rgba(200,167,99,0.2)',
                      fontSize: '13px',
                      fontWeight: activeDay === day ? 'bold' : '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      opacity: count === 0 && activeDay !== day ? 0.5 : 1
                    }}
                  >
                    {day} {count > 0 && `(${count})`}
                  </button>
                );
              })}
            </div>

            {/* Active Day Slots Grid */}
            <div style={{ background: 'rgba(200,167,99,0.03)', borderRadius: '12px', padding: '20px', border: '1px solid rgba(200,167,99,0.1)', minHeight: '180px' }}>
              <h4 style={{ color: 'var(--color-gold)', marginBottom: '20px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                {activeDay} Slots
              </h4>
              
              {groupedTeacherSlots[activeDay]?.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
                  {groupedTeacherSlots[activeDay].map((slot, i) => (
                    <button key={i} onClick={() => handleSlotClick(slot)}
                      style={{
                        display: 'block', width: '100%', textAlign: 'left',
                        background: 'rgba(200,167,99,0.08)', border: '1px solid rgba(200,167,99,0.15)',
                        borderRadius: '10px', padding: '14px', cursor: 'pointer',
                        color: 'var(--color-cream)', fontFamily: 'var(--font-family)',
                        transition: 'all 0.2s ease-out'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(200,167,99,0.15)'; e.currentTarget.style.borderColor = 'rgba(200,167,99,0.4)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(200,167,99,0.08)'; e.currentTarget.style.borderColor = 'rgba(200,167,99,0.15)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      <div style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '6px', color: 'var(--color-gold)' }}>
                        {slot.start_time} <span style={{ color: 'var(--color-text-muted)', fontSize: '12px', fontWeight: 'normal', margin: '0 4px' }}>to</span> {slot.end_time}
                      </div>
                      <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        {slot.teacher_name}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--color-text-muted)', fontSize: '14px', background: 'rgba(0,0,0,0.1)', borderRadius: '8px' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" style={{marginBottom: '10px'}}><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                  <br />No available slots for {activeDay}.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Form */}
      <div className="dash-form-container" style={{ marginTop: '24px' }}>
        <h3>{editingSessionId ? 'Edit Scheduled Session' : 'Assign Student to Slot'}</h3>
        {conflictWarning && (
          <div className="dash-alert dash-alert-warning" style={{marginBottom: '16px', background: 'rgba(255, 193, 7, 0.1)', color: '#ffc107', border: '1px solid #ffc107'}}>
            {conflictWarning}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="dash-form-grid">
            <div className="dash-form-group">
              <label>Teacher</label>
              <SearchableSelect
                options={teachers.map(t => ({ value: t._id, label: t.full_name }))}
                value={form.teacher_id}
                onChange={val => setForm({...form, teacher_id: val})}
                placeholder="Select Teacher"
                required
              />
            </div>
            <div className="dash-form-group">
              <label>Student (by ID)</label>
              <SearchableSelect
                options={students.map(s => ({ value: s._id, label: `[${s.student_id}] ${s.full_name} ${s.family_name}` }))}
                value={form.student_id}
                onChange={val => setForm({...form, student_id: val})}
                placeholder="Select Student"
                required
              />
            </div>
            <div className="dash-form-group">
              <label>Day</label>
              <select value={form.day} onChange={e => setForm({...form, day: e.target.value})} required>
                <option value="">Select Day</option>
                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="dash-form-group">
              <label>Start Time</label>
              <input type="time" value={form.start_time} onChange={e => setForm({...form, start_time: e.target.value})} required />
            </div>
            <div className="dash-form-group">
              <label>End Time</label>
              <input type="time" value={form.end_time} readOnly style={{background: 'rgba(255,255,255,0.05)'}} />
            </div>
            <div className="dash-form-group">
              <label>Duration</label>
              <select value={form.duration} onChange={e => setForm({...form, duration: e.target.value})}>
                {['30 min', '40 min', '45 min', '60 min', '90 min', '120 min'].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="dash-form-actions" style={{ display: 'flex', gap: '12px' }}>
              <Button type="submit" variant="primary">{editingSessionId ? 'Update Session' : 'Schedule Session'}</Button>
              {editingSessionId && (
                <Button type="button" variant="outline" onClick={() => {
                  setEditingSessionId(null);
                  setForm({ teacher_id: '', student_id: '', day: '', start_time: '', end_time: '', duration: '60 min' });
                }}>Cancel Edit</Button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Scheduled Sessions */}
      <div className="dash-table-container">
        <div className="dash-table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Scheduled Sessions ({scheduled.length})</h3>
          <input
            type="text"
            placeholder="Search by student or teacher..."
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
            <thead><tr><th>Student ID</th><th>Student</th><th>Teacher</th><th>Day</th><th>Time</th><th>Duration</th><th style={{textAlign: 'center'}}>Actions</th></tr></thead>
            <tbody>
              {scheduled
                .filter(s => {
                  if (!searchQuery.trim()) return true;
                  const q = searchQuery.toLowerCase();
                  return (
                    (s.student_name && s.student_name.toLowerCase().includes(q)) ||
                    (s.teacher_name && s.teacher_name.toLowerCase().includes(q)) ||
                    (s.student_family_id && s.student_family_id.toLowerCase().includes(q))
                  );
                })
                .map(s => (
                <tr key={s._id}>
                  <td style={{color:'var(--color-gold)',fontWeight:600}}>{s.student_family_id}</td>
                  <td>{s.student_name}</td><td>{s.teacher_name}</td>
                  <td>{s.day}</td><td>{s.start_time} – {s.end_time}</td>
                  <td>{s.duration}</td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button onClick={() => handleEdit(s)} style={{ background: 'transparent', border: 'none', color: 'var(--color-gold)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', borderRadius: '4px', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background='rgba(200,167,99,0.1)'} onMouseLeave={e => e.currentTarget.style.background='transparent'} title="Edit Session">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(s._id)} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', borderRadius: '4px', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background='rgba(248,113,113,0.1)'} onMouseLeave={e => e.currentTarget.style.background='transparent'} title="Delete Session">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!scheduled.length && <tr><td colSpan="7" style={{textAlign:'center',color:'var(--color-text-muted)'}}>No sessions scheduled</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
