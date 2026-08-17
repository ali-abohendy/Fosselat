import { useState, useEffect } from 'react';
import Button from '../../components/Button';
import MultiCreatableSelect from '../../components/MultiCreatableSelect';
import API from '../../config';
const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('fossclat_token')}`,
});

const DAYS_MAP = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function TeacherRecordSession() {
  const [students, setStudents] = useState([]);
  const [scheduled, setScheduled] = useState([]);
  const [form, setForm] = useState({
    student_id: '', duration: '60 min', status: 'present', subject: [],
    date: new Date().toISOString().split('T')[0], notes: '',
  });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [autoDetectedSession, setAutoDetectedSession] = useState(null);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    document.title = 'Record Session — Teacher';
    fetch(`${API}/teacher/students`, { headers: getHeaders() })
      .then(r => r.json())
      .then(d => { if (d.success) setStudents(d.data); })
      .catch(() => {});
      
    fetch(`${API}/teacher/calendar`, { headers: getHeaders() })
      .then(r => r.json())
      .then(d => { if (d.success) setScheduled(d.data?.scheduled || []); })
      .catch(() => {});
  }, []);

  // When student or date changes, try to auto-detect the session
  useEffect(() => {
    if (form.student_id && form.date) {
      const selectedDate = new Date(form.date);
      const dayName = DAYS_MAP[selectedDate.getDay()];
      
      const foundSession = scheduled.find(s => s.student_id === form.student_id && s.day === dayName && s.active !== false);
      if (foundSession) {
        setAutoDetectedSession(foundSession);
        setForm(prev => ({
          ...prev,
          duration: foundSession.duration || '60 min',
          start_time: foundSession.start_time,
          end_time: foundSession.end_time,
          subject: foundSession.subject ? (Array.isArray(foundSession.subject) ? foundSession.subject : [foundSession.subject]) : prev.subject
        }));
      } else {
        setAutoDetectedSession(null);
        setForm(prev => ({ ...prev, start_time: undefined, end_time: undefined }));
      }
    }
  }, [form.student_id, form.date, scheduled]);

  const handleStudentChange = (id) => {
    const s = students.find(x => x._id === id);
    setForm(prev => ({ 
      ...prev, 
      student_id: id,
      subject: s && s.subject ? (Array.isArray(s.subject) ? s.subject : [s.subject]) : []
    }));
    setSelectedStudent(s || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setAlert(null);
    if (!form.student_id) { setAlert({ type: 'error', msg: 'Select a student' }); return; }
    
    // Ensure we are not recording in the future
    const selectedDate = new Date(form.date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (selectedDate > today) {
      setAlert({ type: 'error', msg: 'Cannot record a session for a future date.' });
      return;
    }

    try {
      const r = await fetch(`${API}/teacher/sessions`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(form) });
      const d = await r.json();
      if (d.success) {
        setAlert({ type: 'success', msg: 'Session recorded successfully!' });
        setForm({ student_id: '', duration: '60 min', status: 'present', subject: [], date: new Date().toISOString().split('T')[0], notes: '' });
        setSelectedStudent(null);
        setAutoDetectedSession(null);
      } else setAlert({ type: 'error', msg: d.message || 'Error' });
    } catch { setAlert({ type: 'error', msg: 'Server error' }); }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <>
      <div className="dash-page-header">
        <h2>Record Session</h2>
        <p>Log attendance for your students</p>
      </div>
      {alert && <div className={`dash-alert dash-alert-${alert.type}`}>{alert.msg}</div>}

      <div className="dash-form-container">
        <h3>Session Details</h3>
        <form onSubmit={handleSubmit}>
          <div className="dash-form-grid">
            <div className="dash-form-group">
              <label>Student</label>
              <select value={form.student_id} onChange={e => handleStudentChange(e.target.value)} required>
                <option value="">Select Student</option>
                {students.map(s => <option key={s._id} value={s._id}>{s.full_name} {s.family_name || ''}</option>)}
              </select>
            </div>
            {selectedStudent && (
              <>
                <div className="dash-form-group">
                  <label>Student Name</label>
                  <input value={selectedStudent.full_name || ''} readOnly style={{ opacity: 0.7 }} />
                </div>
                <div className="dash-form-group">
                  <label>Family Name</label>
                  <input value={selectedStudent.family_name || ''} readOnly style={{ opacity: 0.7 }} />
                </div>
              </>
            )}
            
            <div className="dash-form-group">
              <label>Date</label>
              <input 
                type="date" 
                value={form.date} 
                onChange={e => setForm({...form, date: e.target.value})} 
                max={todayStr}
                required
              />
            </div>

            {autoDetectedSession && (
              <div className="dash-form-group full-width" style={{ background: 'rgba(200,167,99,0.08)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(200,167,99,0.2)' }}>
                <strong style={{color:'var(--color-gold)'}}>Session Auto-Detected:</strong> {autoDetectedSession.start_time} - {autoDetectedSession.end_time} ({autoDetectedSession.duration})
              </div>
            )}

            <div className="dash-form-group">
              <label>Duration</label>
              <select 
                value={form.duration} 
                onChange={e => setForm({...form, duration: e.target.value})}
                disabled={!!autoDetectedSession}
                style={{ opacity: autoDetectedSession ? 0.7 : 1, cursor: autoDetectedSession ? 'not-allowed' : 'pointer' }}
              >
                {['30 min', '40 min', '45 min', '60 min', '90 min', '120 min'].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="dash-form-group">
              <MultiCreatableSelect
                label="Subjects Taught"
                options={[
                  { value: 'Quran', label: 'Quran' },
                  { value: 'Arabic', label: 'Arabic' },
                  { value: 'Islamic Studies', label: 'Islamic Studies' }
                ]}
                value={form.subject}
                onChange={(val) => setForm({ ...form, subject: val })}
                placeholder="Type or select subjects..."
              />
            </div>
            
            <div className="dash-form-group">
              <label>Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
              </select>
            </div>
            
            <div className="dash-form-group full-width">
              <label>Notes</label>
              <textarea rows="3" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Session notes..." />
            </div>
            <div className="dash-form-actions">
              <Button type="submit" variant="primary">Record Session</Button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
