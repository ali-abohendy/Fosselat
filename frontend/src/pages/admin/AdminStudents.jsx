import { useState, useEffect } from 'react';
import { Edit2 } from 'lucide-react';
import Button from '../../components/Button';
import SearchableSelect from '../../components/SearchableSelect';
import MultiCreatableSelect from '../../components/MultiCreatableSelect';
import API from '../../config';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('fossclat_token')}`,
});

const PROGRAM_TRACKS = [
  { track: 'Quran Track', programs: [
    'Reading & Tajweed', 'Memorization & Hifz', 'Ijazah Preparation'
  ]},
  { track: 'Arabic Track', programs: [
    'Arabic Foundation Pathway', 'Arabic Post-Foundation Pathway'
  ]},
  { track: 'Islamic Studies Track', programs: [
    'Comprehensive Islamic Studies', 'Tafsir', 'Hadith', 'Seerah', 'Aqeedah', 'Fiqh', 'Manners & Adab'
  ]},
];

const PLANS = [
  { id: 'starter', name: 'Starter (2/week)', classes: 2 },
  { id: 'growth', name: 'Growth (3/week)', classes: 3 },
  { id: 'excellence', name: 'Excellence (4/week)', classes: 4 },
  { id: 'elite', name: 'Elite (5/week, 10% off)', classes: 5 },
];

const DURATIONS = [
  { minutes: 30, rate: 5 }, { minutes: 40, rate: 6.67 }, { minutes: 45, rate: 7.5 },
  { minutes: 60, rate: 10 }, { minutes: 90, rate: 15 }, { minutes: 120, rate: 20 },
];

const emptyForm = {
  full_name: '', family_name: '', teacher_id: '',
  hourly_rate: '', status: 'active', start_date: '', phone: '', age: '',
  programs: [], plan: '', class_duration: '', subject: [],
};

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [alert, setAlert] = useState(null);
  const [credentials, setCredentials] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchStudents = () => {
    fetch(`${API}/admin/students`, { headers: getHeaders() })
      .then(r => r.json()).then(d => { if (d.success) setStudents(d.data); }).catch(() => {});
  };

  const fetchTeachers = () => {
    fetch(`${API}/admin/teachers`, { headers: getHeaders() })
      .then(r => r.json()).then(d => { if (d.success) setTeachers(d.data); }).catch(() => {});
  };

  useEffect(() => { document.title = 'Students — Admin'; fetchStudents(); fetchTeachers(); }, []);


  // Auto-calculate rate when plan/duration change
  useEffect(() => {
    if (form.plan && form.class_duration) {
      const plan = PLANS.find(p => p.id === form.plan);
      const dur = DURATIONS.find(d => d.minutes === parseInt(form.class_duration));
      if (plan && dur) {
        const base = plan.classes * 4 * dur.rate;
        const discount = plan.id === 'elite' ? base * 0.10 : 0;
        setForm(prev => ({ ...prev, hourly_rate: (base - discount).toFixed(2) }));
      }
    }
  }, [form.plan, form.class_duration]);

  const toggleCheckbox = (field, value) => {
    setForm(prev => {
      const arr = prev[field] || [];
      return { ...prev, [field]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] };
    });
  };

  const validate = () => {
    const errors = [];
    if (!form.full_name.trim()) errors.push('Student Name is required');
    if (!form.family_name.trim()) errors.push('Family Name is required');
    if (!form.phone.trim()) errors.push('Phone Number is required');
    if (!form.teacher_id) errors.push('Please assign a teacher');
    if (!form.programs.length) errors.push('Please select at least one program');
    if (!form.plan) errors.push('Please select a plan');
    if (!form.class_duration) errors.push('Please select a class duration');
    if (!form.start_date) errors.push('Please set a start date');
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null); setCredentials(null); setValidationErrors([]);

    const errors = validate();
    if (errors.length) {
      setValidationErrors(errors);
      setAlert({ type: 'error', msg: `Please fix ${errors.length} error(s) below.` });
      return;
    }

    // Attach teacher name from selected teacher
    const teacher = teachers.find(t => t._id === form.teacher_id);
    const payload = {
      ...form,
      // Send arrays as comma-separated for backend compat
      program: form.programs.join(', '),
      teacher_name: teacher ? `${teacher.full_name} ${teacher.family_name || ''}`.trim() : '',
    };
    const url = editingId ? `${API}/admin/students/${editingId}` : `${API}/admin/students`;
    const method = editingId ? 'PUT' : 'POST';
    try {
      const r = await fetch(url, { method, headers: getHeaders(), body: JSON.stringify(payload) });
      const d = await r.json();
      if (d.success) {
        if (d.data?.email && d.data?.generated_password) {
          setCredentials({ email: d.data.email, password: d.data.generated_password, student_id: d.data.student_id });
        }
        setAlert({ type: 'success', msg: editingId ? 'Student updated!' : 'Student added!' });
        setForm(emptyForm); setEditingId(null); fetchStudents();
      } else { setAlert({ type: 'error', msg: d.message || 'Error' }); }
    } catch { setAlert({ type: 'error', msg: 'Server error' }); }
  };

  const handleEdit = (s) => {
    setEditingId(s._id); setCredentials(null); setValidationErrors([]);
    // Parse programs back to array
    const progArr = s.program ? s.program.split(',').map(x => x.trim()).filter(Boolean) : [];
    setForm({
      full_name: s.full_name || '', family_name: s.family_name || '',
      teacher_id: s.teacher_id || '',
      hourly_rate: s.hourly_rate || '', status: s.status || 'active',
      start_date: s.start_date?.split('T')[0] || '', phone: s.phone || '', age: s.age || '',
      programs: progArr, plan: s.plan || '',
      class_duration: s.class_duration || '',
      subject: s.subject || [],
    });
  };

  return (
    <>
      <div className="dash-page-header">
        <h2>Student Management</h2>
        <p>Add and manage student records — credentials are auto-generated on creation</p>
      </div>

      {alert && <div className={`dash-alert dash-alert-${alert.type}`}>{alert.msg}</div>}

      {validationErrors.length > 0 && (
        <div className="dash-alert dash-alert-error" style={{ lineHeight: 1.8 }}>
          {validationErrors.map((err, i) => <div key={i}>⚠ {err}</div>)}
        </div>
      )}

      {credentials && (
        <div className="dash-alert dash-alert-success" style={{ lineHeight: 1.8 }}>
          <strong>📋 Student Credentials (share with student):</strong><br />
          Student ID: <strong>{credentials.student_id}</strong><br />
          Email: <strong>{credentials.email}</strong><br />
          Password: <strong>{credentials.password}</strong>
        </div>
      )}

      <div className="dash-form-container">
        <h3>{editingId ? 'Edit Student' : 'Add Student'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="dash-form-grid">
            <div className="dash-form-group">
              <label>Student Name <span style={{color:'var(--color-gold)'}}>*</span></label>
              <input value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})}
                placeholder="First name" required />
            </div>
            <div className="dash-form-group">
              <label>Family Name <span style={{color:'var(--color-gold)'}}>*</span></label>
              <input value={form.family_name} onChange={e => setForm({...form, family_name: e.target.value})}
                placeholder="Family / Last name" required />
            </div>
            <div className="dash-form-group">
              <label>Phone Number <span style={{color:'var(--color-gold)'}}>*</span></label>
              <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} 
                placeholder="+201234567890" required />
            </div>
            <div className="dash-form-group">
              <label>Age</label>
              <input type="number" value={form.age} onChange={e => setForm({...form, age: e.target.value})} 
                placeholder="e.g. 12" />
            </div>
            <div className="dash-form-group">
              <SearchableSelect
                label="Assign Teacher"
                options={teachers.map(t => ({ value: t._id, label: `${t.full_name} ${t.family_name || ''}`.trim() }))}
                value={form.teacher_id}
                onChange={val => setForm({...form, teacher_id: val})}
                placeholder="Search or select Teacher"
                required
              />
            </div>
            
            <div className="dash-form-group">
              <MultiCreatableSelect
                label="Subjects"
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

            {/* Programs — Checkbox */}
            <div className="dash-form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Programs <span style={{color:'var(--color-gold)'}}>*</span> <span style={{color:'var(--color-text-muted)', fontSize:'12px'}}>(select all that apply)</span></label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
                {PROGRAM_TRACKS.map(trackData => (
                  <div key={trackData.track}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-gold)', marginBottom: '8px' }}>
                      {trackData.track}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {trackData.programs.map(p => (
                        <label key={p} style={{
                          display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
                          padding: '8px 18px', borderRadius: '20px', fontSize: '13px', fontWeight: 600,
                          border: `1px solid ${form.programs.includes(p) ? 'var(--color-gold)' : 'rgba(200,167,99,0.15)'}`,
                          background: form.programs.includes(p) ? 'rgba(200,167,99,0.12)' : 'transparent',
                          color: form.programs.includes(p) ? 'var(--color-gold)' : 'var(--color-text-muted)',
                          transition: 'all 0.2s',
                        }}>
                          <input type="checkbox" checked={form.programs.includes(p)}
                            onChange={() => toggleCheckbox('programs', p)}
                            style={{ display: 'none' }} />
                          {form.programs.includes(p) ? '✓' : '○'} {p}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="dash-form-group">
              <label>Plan <span style={{color:'var(--color-gold)'}}>*</span></label>
              <select value={form.plan} onChange={e => setForm({...form, plan: e.target.value})} required>
                <option value="">Select Plan</option>
                {PLANS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="dash-form-group">
              <label>Class Duration <span style={{color:'var(--color-gold)'}}>*</span></label>
              <select value={form.class_duration} onChange={e => setForm({...form, class_duration: e.target.value})} required>
                <option value="">Select Duration</option>
                {DURATIONS.map(d => <option key={d.minutes} value={d.minutes}>{d.minutes} min (${d.rate}/class)</option>)}
              </select>
            </div>
            <div className="dash-form-group">
              <label>Monthly Rate ($) {form.plan && form.class_duration ? '(auto-calculated)' : ''}</label>
              <input type="number" value={form.hourly_rate} onChange={e => setForm({...form, hourly_rate: e.target.value})}
                style={form.plan && form.class_duration ? { opacity: 0.7 } : {}} required />
            </div>
            <div className="dash-form-group">
              <label>Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} required>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="dash-form-group">
              <label>Start Date <span style={{color:'var(--color-gold)'}}>*</span></label>
              <input type="date" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} required />
            </div>
            <div className="dash-form-actions">
              <Button type="submit" variant="primary">{editingId ? 'Update' : 'Add Student'}</Button>
              {editingId && <Button variant="outline" onClick={() => { setEditingId(null); setForm(emptyForm); setCredentials(null); setValidationErrors([]); }}>Cancel</Button>}
            </div>
          </div>
        </form>
      </div>

      <div className="dash-table-container">
        <div className="dash-table-header">
          <h3>All Students ({students.length})</h3>
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
              outline: 'none',
              fontFamily: 'var(--font-family)',
            }}
          />
        </div>
        <div style={{overflowX:'auto'}}>
          <table className="dash-table">
            <thead>
              <tr>
                <th>ID</th><th>Name</th><th>Family</th><th>Email</th><th>Password</th>
                <th>Age</th><th>Teacher</th><th>Programs</th>
                <th>Rate/mo</th><th>Status</th><th>Phone</th><th style={{textAlign: 'center'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students
                .filter(s => {
                  if (!searchQuery.trim()) return true;
                  const q = searchQuery.toLowerCase();
                  return (
                    (s.student_id || '').toLowerCase().includes(q) ||
                    (s.full_name || '').toLowerCase().includes(q) ||
                    (s.family_name || '').toLowerCase().includes(q)
                  );
                })
                .map(s => (
                <tr key={s._id}>
                  <td style={{color:'var(--color-gold)',fontWeight:600}}>{s.student_id || '—'}</td>
                  <td>{s.full_name}</td><td>{s.family_name}</td>
                  <td style={{fontSize:'12px'}}>{s.email || '-'}</td>
                  <td style={{fontSize:'12px'}}>{s.generated_password || s.plain_password || '-'}</td>
                  <td>{s.age || '-'}</td>
                  <td>{s.teacher_name}</td>
                  <td>{s.program || '—'}</td>
                  <td>${s.hourly_rate || 0}</td>

                  <td><span className={`status-badge status-${s.status}`}>{s.status}</span></td>
                  <td>{s.phone}</td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button onClick={() => handleEdit(s)} style={{ background: 'transparent', border: 'none', color: 'var(--color-gold)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', borderRadius: '4px', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background='rgba(200,167,99,0.1)'} onMouseLeave={e => e.currentTarget.style.background='transparent'} title="Edit">
                        <Edit2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!students.length && <tr><td colSpan="13" style={{textAlign:'center',color:'var(--color-text-muted)'}}>No students yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
