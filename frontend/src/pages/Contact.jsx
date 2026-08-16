import { useState, useEffect } from 'react';
import Button from '../components/Button';
import { Mail, Globe } from '../components/Icons';
import { contactAPI } from '../services/api';
import './Contact.css';

// SVG Icons for Socials
const InstagramIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const TikTokIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.04.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.78-1.15 5.54-3.33 7.37-1.89 1.59-4.52 2.21-6.9 1.7-2.61-.55-4.83-2.31-5.75-4.81-.88-2.36-.61-5.11 1.05-7.14 1.48-1.81 3.86-2.73 6.13-2.58v4.07c-1.15-.09-2.35.34-3.13 1.18-.83.89-1.04 2.26-.52 3.39.52 1.1 1.71 1.81 2.92 1.82 1.62.01 3.03-1.13 3.35-2.71.13-.67.11-1.37.11-2.05V.02h2.07z"/>
  </svg>
);

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Contact Us — Fosselat Academy';
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    if (!formData.name || !formData.email || !formData.message) {
      setStatus({ type: 'error', message: 'Please fill in all fields.' });
      return;
    }

    setLoading(true);
    try {
      const res = await contactAPI.submit(formData);
      if (res && res.success) {
        setStatus({ type: 'success', message: 'Your message has been sent successfully! We will get back to you soon.' });
        setFormData({ name: '', email: '', message: '' });
      } else {
        setStatus({ type: 'success', message: 'Message sent! We will get back to you soon.' });
        setFormData({ name: '', email: '', message: '' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-enter">
      {/* Hero */}
      <section className="contact-hero">
        <div className="contact-hero-overlay" />
        <div className="container contact-hero-content">
          <h1>Contact Us</h1>
          <p>We'd love to hear from you</p>
        </div>
      </section>

      {/* Content */}
      <section className="section contact-section">
        <div className="container contact-grid">
          {/* Left — Form */}
          <div className="contact-form-card animate-fade-in-up">
            <h2>Send a Message</h2>
            <div className="gold-line" />

            {status.message && (
              <div className={`contact-alert contact-alert-${status.type}`}>
                {status.type === 'success' ? '✅' : '⚠️'} {status.message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label htmlFor="name">Your Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Your Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  placeholder="Write your message here..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>

              <Button type="submit" variant="primary" block disabled={loading}>
                {loading ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </div>

          {/* Right — Info Cards */}
          <div className="contact-info animate-fade-in-up delay-2">
            <h3>Get in Touch</h3>
            <p className="contact-info-subtitle">
              Feel free to reach out through any of the channels below.
            </p>

            <div className="contact-info-cards">
              <div className="contact-info-card">
                <span className="contact-info-icon"><Mail size={24} /></span>
                <div>
                  <h4>Email</h4>
                  <a href="mailto:info@fosselatacademy.com">info@fosselatacademy.com</a>
                </div>
              </div>
            </div>
            
            <h3 style={{ marginTop: '30px', marginBottom: '15px' }}>Follow Us</h3>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <a href="https://www.instagram.com/fosselatacademy2001/" target="_blank" rel="noopener noreferrer" 
                 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', background: 'rgba(200,167,99,0.1)', color: 'var(--color-gold)', borderRadius: '12px', transition: 'all 0.3s' }}>
                <InstagramIcon />
              </a>
              <a href="https://www.facebook.com/profile.php?id=61590983983531" target="_blank" rel="noopener noreferrer"
                 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', background: 'rgba(200,167,99,0.1)', color: 'var(--color-gold)', borderRadius: '12px', transition: 'all 0.3s' }}>
                <FacebookIcon />
              </a>
              <a href="https://www.tiktok.com/@user4744086184577?lang=en" target="_blank" rel="noopener noreferrer"
                 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', background: 'rgba(200,167,99,0.1)', color: 'var(--color-gold)', borderRadius: '12px', transition: 'all 0.3s' }}>
                <TikTokIcon />
              </a>
            </div>

            {/* Decorative element */}
            <div className="contact-decoration">
              <img src="/logo_contact.png" alt="Fosselat Logo" className="contact-decor-logo" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
