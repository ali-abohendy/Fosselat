import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const { login, user } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Login — Fosselat Academy';
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      switch (user.role) {
        case 'admin': navigate('/admin/dashboard'); break;
        case 'teacher': navigate('/teacher/dashboard'); break;
        default: navigate('/student/dashboard'); break;
      }
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const result = await login(formData.email, formData.password);
      if (!result.success) {
        setError(result.message || 'Invalid email or password.');
      }
      // redirect is handled by the useEffect above when user state updates
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-enter">
      <section className="auth-page">
        <div className="auth-grid">
          {/* Left — Decorative Panel */}
          <div className="auth-decoration">
            <div className="auth-decor-bg" />
            <div className="auth-decor-content">
              <div className="auth-arch-frame">


                <div className="auth-decor-diamonds">
                  <span /><span /><span /><span />
                </div>

                <img src="/logo.png" alt="Fosselat Logo" className="auth-decor-logo" />

                <h2 className="auth-decor-title">Fosselat</h2>
                <p className="auth-decor-subtitle">Islamic Qur'an School</p>

                <div className="auth-decor-diamonds">
                  <span /><span /><span /><span /><span />
                </div>
              </div>
            </div>
          </div>

          {/* Right — Login Form */}
          <div className="auth-form-wrapper">
            <div className="auth-form-card animate-fade-in-up">
              <h2>Welcome Back</h2>
              <p className="auth-subtitle">Login to your account</p>
              <div className="gold-line" />

              {error && (
                <div className="auth-alert auth-alert-error">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <div className="password-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <div className="auth-options">
                  <label className="auth-checkbox">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                    />
                    <span className="checkmark" />
                    Remember Me
                  </label>
                </div>

                <Button type="submit" variant="primary" block disabled={loading}>
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </form>


            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
