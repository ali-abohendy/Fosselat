import { useState, useEffect } from 'react';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import API from '../../config';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('fossclat_token')}`,
});

export default function TeacherSettings() {
  const { user, login } = useAuth();
  const [form, setForm] = useState({
    full_name: '',
    family_name: '',
    phone: '',
    password: '',
    zoom_link: '',
    google_meet_link: '',
  });
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Settings — Fosselat';
    if (user) {
      setForm({
        full_name: user.full_name || '',
        family_name: user.family_name || '',
        phone: user.phone || '',
        password: '', // Blank by default
        zoom_link: user.zoom_link || '',
        google_meet_link: user.google_meet_link || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);
    setLoading(true);

    try {
      const res = await fetch(`${API}/auth/profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(form),
      });
      const data = await res.json();
      
      if (data.success) {
        setAlert({ type: 'success', msg: 'Profile updated successfully!' });
        login(data.data, localStorage.getItem('fossclat_token'));
        setForm(prev => ({ ...prev, password: '' }));
      } else {
        setAlert({ type: 'error', msg: data.message || 'Error updating profile.' });
      }
    } catch (err) {
      setAlert({ type: 'error', msg: 'Server error. Please try again later.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="dash-page-header">
        <h2>Account Settings</h2>
        <p>Update your profile, meeting links, and security settings.</p>
      </div>

      {alert && <div className={`dash-alert dash-alert-${alert.type}`}>{alert.msg}</div>}

      <div className="dash-form-container" style={{ maxWidth: '800px' }}>
        <h3>Personal Information</h3>
        <form onSubmit={handleSubmit}>
          <div className="dash-form-grid">
            <div className="dash-form-group">
              <label>First Name <span style={{color:'var(--color-gold)'}}>*</span></label>
              <input 
                value={form.full_name} 
                onChange={e => setForm({...form, full_name: e.target.value})}
                placeholder="First name" 
                required 
              />
            </div>
            
            <div className="dash-form-group">
              <label>Family Name <span style={{color:'var(--color-gold)'}}>*</span></label>
              <input 
                value={form.family_name} 
                onChange={e => setForm({...form, family_name: e.target.value})}
                placeholder="Family / Last name" 
                required 
              />
            </div>

            <div className="dash-form-group">
              <label>Phone Number <span style={{color:'var(--color-gold)'}}>*</span></label>
              <input 
                type="tel"
                value={form.phone} 
                onChange={e => setForm({...form, phone: e.target.value})}
                placeholder="+1234567890" 
                required 
              />
            </div>

            <div className="dash-form-group">
              <label>Email Address</label>
              <input 
                type="email"
                value={user?.email || ''} 
                disabled
                style={{ opacity: 0.7, cursor: 'not-allowed' }}
                title="Contact admin to change your email"
              />
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Email cannot be changed directly. Contact admin if needed.</span>
            </div>

            <div className="dash-form-group" style={{ gridColumn: '1 / -1', marginTop: '16px' }}>
              <h3 style={{ borderBottom: '1px solid rgba(200, 167, 99, 0.2)', paddingBottom: '8px', marginBottom: '16px', color: 'var(--color-cream)' }}>
                Online Classroom Links
              </h3>
            </div>

            <div className="dash-form-group">
              <label>Zoom Meeting Link</label>
              <input 
                type="url"
                value={form.zoom_link} 
                onChange={e => setForm({...form, zoom_link: e.target.value})}
                placeholder="https://zoom.us/j/..." 
              />
            </div>

            <div className="dash-form-group">
              <label>Google Meet Link</label>
              <input 
                type="url"
                value={form.google_meet_link} 
                onChange={e => setForm({...form, google_meet_link: e.target.value})}
                placeholder="https://meet.google.com/..." 
              />
            </div>

            <div className="dash-form-group" style={{ gridColumn: '1 / -1', marginTop: '16px' }}>
              <h3 style={{ borderBottom: '1px solid rgba(200, 167, 99, 0.2)', paddingBottom: '8px', marginBottom: '16px', color: 'var(--color-cream)' }}>
                Security
              </h3>
            </div>

            <div className="dash-form-group" style={{ gridColumn: '1 / -1' }}>
              <label>New Password <span style={{color:'var(--color-text-muted)', fontSize:'12px'}}>(leave blank to keep current)</span></label>
              <input 
                type="password"
                value={form.password} 
                onChange={e => setForm({...form, password: e.target.value})}
                placeholder="Min 8 characters" 
                minLength="8" 
              />
            </div>

            <div className="dash-form-actions" style={{ gridColumn: '1 / -1', marginTop: '24px' }}>
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
