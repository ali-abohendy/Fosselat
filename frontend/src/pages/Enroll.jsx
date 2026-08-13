import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Button from '../components/Button';
import { enrollmentsAPI, coursesAPI, fallbackData } from '../services/api';
import './Enroll.css';

const PROGRAMS = [
  { id: 'quran', name: 'Quran Program' },
  { id: 'arabic', name: 'Arabic Program' },
  { id: 'islamic', name: 'Islamic Studies' },
  { id: 'comprehensive', name: 'Comprehensive Program' },
];

const PLANS = [
  { id: 'starter', name: 'Starter (2/week)', classes: 2 },
  { id: 'growth', name: 'Growth (3/week)', classes: 3 },
  { id: 'excellence', name: 'Excellence (4/week)', classes: 4 },
  { id: 'elite', name: 'Elite (5/week, 10% off)', classes: 5, discount: 0.10 },
];

const DURATIONS = [
  { minutes: 30, rate: 4 }, { minutes: 40, rate: 5.33 }, { minutes: 45, rate: 6 },
  { minutes: 60, rate: 8 }, { minutes: 90, rate: 12 }, { minutes: 120, rate: 16 },
];

export default function Enroll() {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    full_name: '', family_name: '', phone: '',
    program: searchParams.get('program') || '',
    plan: searchParams.get('plan') || '',
    class_duration: searchParams.get('duration') || '',
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Enroll Now — Fosselat Academy';
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Calculate monthly rate
  const calculateMonthly = () => {
    const plan = PLANS.find(p => p.id === formData.plan);
    const dur = DURATIONS.find(d => d.minutes === parseInt(formData.class_duration));
    if (!plan || !dur) return null;
    const base = plan.classes * 4 * dur.rate;
    const discount = plan.discount ? base * plan.discount : 0;
    return { total: (base - discount).toFixed(2), hasDiscount: !!plan.discount, base: base.toFixed(2), discount: discount.toFixed(2) };
  };

  const pricing = calculateMonthly();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    if (!formData.full_name || !formData.family_name || !formData.phone || !formData.program || !formData.plan || !formData.class_duration) {
      setStatus({ type: 'error', message: 'Please fill in all fields.' });
      return;
    }

    setLoading(true);
    try {
      const payload = { ...formData, monthly_rate: pricing?.total || 0 };
      const res = await enrollmentsAPI.create(payload);
      if (res && res.success) {
        setStatus({ type: 'success', message: 'Enrollment submitted successfully! We will contact you soon.' });
        setFormData({ full_name: '', family_name: '', phone: '', program: '', plan: '', class_duration: '' });
      } else {
        setStatus({ type: 'success', message: 'Enrollment submitted! We will contact you soon.' });
        setFormData({ full_name: '', family_name: '', phone: '', program: '', plan: '', class_duration: '' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-enter">
      <section className="enroll-page">
        <div className="enroll-grid">
          {/* Left — Decorative Panel */}
          <div className="enroll-decoration">
            <div className="enroll-decor-bg" />
            <div className="enroll-decor-content">
              <div className="enroll-golden-frame">
                <div className="enroll-frame-corner enroll-frame-tl" />
                <div className="enroll-frame-corner enroll-frame-tr" />
                <div className="enroll-frame-corner enroll-frame-bl" />
                <div className="enroll-frame-corner enroll-frame-br" />

                <div className="enroll-arch">
                  <div className="enroll-arch-inner">
                    <div className="enroll-motif">
                      <span className="enroll-motif-icon">📖</span>
                    </div>
                  </div>
                </div>

                <div className="enroll-diamond-row">
                  <span /><span /><span />
                </div>

                <h2>Fosselat Academy</h2>
                <p className="enroll-tagline">Learn Qur'an. The Right Way.</p>

                <div className="enroll-diamond-row">
                  <span /><span /><span />
                </div>
              </div>
            </div>
          </div>

          {/* Right — Form */}
          <div className="enroll-form-wrapper">
            <div className="enroll-form-card animate-fade-in-up">
              <h2>Enroll Now</h2>
              <p className="enroll-subtitle">
                Start your Qur'an learning journey with us today
              </p>
              <div className="gold-line" />

              {status.message && (
                <div className={`enroll-alert enroll-alert-${status.type}`}>
                  {status.type === 'success' ? '✅' : '⚠️'} {status.message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="enroll-form">
                <div className="form-group">
                  <label htmlFor="full_name">Full Name</label>
                  <input type="text" id="full_name" name="full_name" placeholder="Enter your name"
                    value={formData.full_name} onChange={handleChange} />
                </div>

                <div className="form-group">
                  <label htmlFor="family_name">Family Name</label>
                  <input type="text" id="family_name" name="family_name" placeholder="Enter your family name"
                    value={formData.family_name} onChange={handleChange} />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input type="tel" id="phone" name="phone" placeholder="+201234567890"
                    value={formData.phone} onChange={handleChange} />
                </div>

                <div className="form-group">
                  <label htmlFor="program">Program</label>
                  <select id="program" name="program" value={formData.program} onChange={handleChange}>
                    <option value="">— Choose a program —</option>
                    {PROGRAMS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="plan">Plan</label>
                  <select id="plan" name="plan" value={formData.plan} onChange={handleChange}>
                    <option value="">— Choose a plan —</option>
                    {PLANS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="class_duration">Class Duration</label>
                  <select id="class_duration" name="class_duration" value={formData.class_duration} onChange={handleChange}>
                    <option value="">— Choose duration —</option>
                    {DURATIONS.map(d => <option key={d.minutes} value={d.minutes}>{d.minutes} min (${d.rate}/class)</option>)}
                  </select>
                </div>

                {pricing && (
                  <div style={{
                    background: 'rgba(200,167,99,0.08)', borderRadius: '8px', padding: '14px 16px',
                    border: '1px solid rgba(200,167,99,0.2)', marginBottom: '8px',
                  }}>
                    {pricing.hasDiscount && (
                      <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                        Subtotal: <span style={{ textDecoration: 'line-through' }}>${pricing.base}</span>
                        <span style={{ color: '#27AE60', marginLeft: '8px' }}>-${pricing.discount} Elite discount</span>
                      </div>
                    )}
                    <div style={{ fontSize: '16px', color: 'var(--color-gold)', fontWeight: 700 }}>
                      Monthly: ${pricing.total}/mo
                    </div>
                  </div>
                )}

                <Button type="submit" variant="primary" block disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Enrollment'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
