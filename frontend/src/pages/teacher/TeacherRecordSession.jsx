import { useState, useEffect } from 'react';
import Button from '../../components/Button';
import MultiCreatableSelect from '../../components/MultiCreatableSelect';
import SearchableSelect from '../../components/SearchableSelect';
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
    student_id: '', duration: '60 min', status: 'present', subject: [], start_time: '', end_time: '',
    date: new Date().toISOString().split('T')[0], notes: '',
  });
  const [selectedStudent, setSelectedStudent] = useState(null);
  
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



  useEffect(() => {
    if (form.start_time && form.duration) {
      const dur = parseInt(form.duration) || 60;
      const [h, m] = form.start_time.split(':').map(Number);
      const endMins = h * 60 + m + dur;
      const endH = Math.floor(endMins / 60) % 24;
      const endM = endMins % 60;
      setForm(prev => ({ ...prev, end_time: `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}` }));
    }
  }, [form.start_time, form.duration]);

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
              <SearchableSelect
                options={students.map(s => ({ value: s._id, label: `${s.full_name} ${s.family_name || ''}`.trim() }))}
                value={form.student_id}
                onChange={handleStudentChange}
                placeholder="Select Student"
                required
              />
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

            

            
            <div className="dash-form-group">
              <label>Start Time</label>
              <input type="time" value={form.start_time || ''} onChange={e => setForm({...form, start_time: e.target.value})} required />
            </div>
            <div className="dash-form-group">
              <label>End Time</label>
              <input type="time" value={form.end_time || ''} readOnly style={{ opacity: 0.7 }} />
            </div>
            <div className="dash-form-group">
              <label>Duration</label>
              <select 
                value={form.duration} 
                onChange={e => setForm({...form, duration: e.target.value})}
                
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
