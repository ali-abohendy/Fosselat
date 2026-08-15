import { useState, useEffect } from 'react';
import Button from '../../components/Button';
import API from '../../config';
const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('fossclat_token')}`,
});

export default function TeacherRecordSession() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({
    student_id: '', duration: '60 min', status: 'present',
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
  }, []);

  const handleStudentChange = (id) => {
    setForm(prev => ({ ...prev, student_id: id }));
    const s = students.find(x => x._id === id);
    setSelectedStudent(s || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setAlert(null);
    if (!form.student_id) { setAlert({ type: 'error', msg: 'Select a student' }); return; }
    try {
      const r = await fetch(`${API}/teacher/sessions`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(form) });
      const d = await r.json();
      if (d.success) {
        setAlert({ type: 'success', msg: 'Session recorded successfully!' });
        setForm({ student_id: '', duration: '60 min', status: 'present', date: new Date().toISOString().split('T')[0], notes: '' });
        setSelectedStudent(null);
      } else setAlert({ type: 'error', msg: d.message || 'Error' });
    } catch { setAlert({ type: 'error', msg: 'Server error' }); }
  };

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
                <div className="dash-form-group">
                  <label>Subject</label>
                  <input value={selectedStudent.subject || ''} readOnly style={{ opacity: 0.7 }} />
                </div>
              </>
            )}
            <div className="dash-form-group">
              <label>Duration</label>
              <select value={form.duration} onChange={e => setForm({...form, duration: e.target.value})}>
                {['30 min', '40 min', '45 min', '60 min', '90 min', '120 min'].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="dash-form-group">
              <label>Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="trial">Trial</option>
              </select>
            </div>
            <div className="dash-form-group">
              <label>Date</label>
              <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
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
