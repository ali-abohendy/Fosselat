import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import Button from '../components/Button';
import { Mail, Phone } from '../components/Icons';
import { contactAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { WHATSAPP_DISPLAY, buildWhatsAppUrl, trackWhatsAppClick } from '../utils/siteActions';
import './Contact.css';

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

export default function Contact() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user ? user.full_name : '',
    email: user ? user.email : '',
    message: '',
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const isSupport = !!user;

  useEffect(() => {
    document.title = isSupport ? 'Support — Fosselat Academy' : 'Contact Us — Fosselat Academy';
  }, [isSupport]);

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
      const payload = { ...formData, isSupport };
      const res = await contactAPI.submit(payload);
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

  const whatsappDirectUrl = buildWhatsAppUrl({ page: isSupport ? 'Support' : 'Contact Us', intent: 'general' });

  return (
    <div className="page-enter">
      {/* Hero */}
      <section className="contact-hero">
        <div className="contact-hero-overlay" />
        <div className="container contact-hero-content">
          <h1>{isSupport ? 'Support' : 'Contact Us'}</h1>
          <p>{isSupport ? 'How can we help you today?' : "We'd love to hear from you — reach us instantly on WhatsApp or by email"}</p>
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
                {status.message}
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

          {/* Right — Info Cards (WhatsApp + Email + Socials) */}
          <div className="contact-info animate-fade-in-up delay-2">
            <h3>Get in Touch</h3>
            <p className="contact-info-subtitle">
              For the fastest response — including booking a Free Trial or scheduling questions — message us directly on WhatsApp.
            </p>

            <div className="contact-info-cards">
              {/* Direct WhatsApp Card */}
              <div className="contact-info-card" style={{ borderColor: 'rgba(200, 167, 99, 0.4)' }}>
                <span className="contact-info-icon" style={{ color: 'var(--color-gold)' }}><Phone size={24} /></span>
                <div style={{ flex: 1 }}>
                  <h4>WhatsApp (Fastest Response)</h4>
                  <a
                    href={whatsappDirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontWeight: 700, fontSize: '1.05rem', display: 'inline-block', marginBottom: '10px' }}
                    onClick={() => trackWhatsAppClick('contact_number_link')}
                  >
                    {WHATSAPP_DISPLAY}
                  </a>
                  <div>
                    <a
                      href={whatsappDirectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pb-whatsapp-btn"
                      style={{ padding: '10px 16px', fontSize: '0.9rem', width: 'auto', display: 'inline-flex' }}
                      onClick={() => trackWhatsAppClick('contact_direct_button')}
                    >
                      <MessageCircle size={17} />
                      Chat on WhatsApp Now
                    </a>
                  </div>
                </div>
              </div>

              {/* Email Card */}
              <div className="contact-info-card">
                <span className="contact-info-icon"><Mail size={24} /></span>
                <div>
                  <h4>Email</h4>
                  <a href={`mailto:${isSupport ? 'support' : 'info'}@fosselatacademy.com`}>
                    {isSupport ? 'support' : 'info'}@fosselatacademy.com
                  </a>
                </div>
              </div>
            </div>

            <h3 style={{ marginTop: '30px', marginBottom: '15px' }}>Follow Us</h3>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <a href="https://www.instagram.com/fosselat_academy?lqvp=eGVqeGdiNDFnOHZ6" target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', background: 'rgba(200,167,99,0.1)', color: 'var(--color-gold)', borderRadius: '12px', transition: 'all 0.3s' }}>
                <InstagramIcon />
              </a>
              <a href="https://www.facebook.com/profile.php?id=61590983983531" target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', background: 'rgba(200,167,99,0.1)', color: 'var(--color-gold)', borderRadius: '12px', transition: 'all 0.3s' }}>
                <FacebookIcon />
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
