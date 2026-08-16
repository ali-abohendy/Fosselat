import { useState, useEffect } from 'react';
import Button from '../../components/Button';
import SearchableSelect from '../../components/SearchableSelect';
import API from '../../config';
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
  const [form, setForm] = useState({ teacher_id: '', student_id: '', day: '', start_time: '', end_time: '', duration: '60 min' });
  const [alert, setAlert] = useState(null);
  const [filterTeacher, setFilterTeacher] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = () => {
    fetch(`${API}/admin/schedule`, { headers: getHeaders() })
      .then(r => r.json()).then(d => { if (d.success) { setSlots(d.data.slots || []); setScheduled(d.data.scheduled || []); }}).catch(() => {});
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
        setForm(prev => ({ ...prev, duration: student.class_duration }));
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

  const conflictWarning = null; // Conflict check disabled by design

  const handleSubmit = async (e) => {
    e.preventDefault(); setAlert(null);
    if (!form.teacher_id || !form.student_id || !form.day || !form.start_time) {
      setAlert({ type: 'error', msg: 'Please fill all required fields' }); return;
    }
    try {
      const r = await fetch(`${API}/admin/schedule`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(form) });
      const d = await r.json();
      if (d.success) { setAlert({ type: 'success', msg: 'Session scheduled!' }); fetchData(); setForm({ teacher_id: '', student_id: '', day: '', start_time: '', end_time: '', duration: '60 min' }); }
      else setAlert({ type: 'error', msg: d.message || 'Error' });
    } catch { setAlert({ type: 'error', msg: 'Server error' }); }
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
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {DAYS.map(day => (
              groupedTeacherSlots[day].length > 0 && (
                <div key={day} style={{ background: 'rgba(200,167,99,0.04)', borderRadius: '8px', padding: '12px', border: '1px solid rgba(200,167,99,0.1)' }}>
                  <h4 style={{ color: 'var(--color-gold)', marginBottom: '8px', fontSize: '14px' }}>{day}</h4>
                  {groupedTeacherSlots[day].map((slot, i) => (
                    <button key={i} onClick={() => handleSlotClick(slot)}
                      style={{
                        display: 'block', width: '100%', textAlign: 'left',
                        background: 'rgba(200,167,99,0.08)', border: '1px solid rgba(200,167,99,0.15)',
                        borderRadius: '6px', padding: '8px 10px', marginBottom: '6px', cursor: 'pointer',
                        color: 'var(--color-cream)', fontSize: '13px', fontFamily: 'var(--font-family)',
                      }}
                    >
                      <strong>{slot.start_time}</strong> – {slot.end_time}
                      <br /><span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{slot.teacher_name}</span>
                    </button>
                  ))}
                </div>
              )
            ))}
          </div>
        </div>
      </div>

      {/* Schedule Form */}
      <div className="dash-form-container" style={{ marginTop: '24px' }}>
        <h3>Assign Student to Slot</h3>
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
            <div className="dash-form-actions">
              <Button type="submit" variant="primary">Schedule Session</Button>
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
            <thead><tr><th>Student ID</th><th>Student</th><th>Teacher</th><th>Day</th><th>Time</th><th>Duration</th><th>Room</th></tr></thead>
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
                  <td style={{fontSize:'11px',color:'var(--color-text-muted)'}}>{s.meeting_room_id}</td>
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
