import { useState, useEffect } from 'react';
import { X, FileText, Download, CheckCircle } from 'lucide-react';
import API from '../config';
import { trackCurriculumLead } from '../utils/siteActions';
import './SharedSections.css';

const PDF_URL = '/Fosselat_Academy_Curriculum_Framework.pdf';

export default function CurriculumDownloadModal({ isOpen, onClose, pageSource = 'Curriculum' }) {
  const [name, setName] = useState('');
  const [contactType, setContactType] = useState('email'); // email | whatsapp
  const [contact, setContact] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const triggerDownload = (url = PDF_URL) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Fosselat_Academy_Curriculum_Framework.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const trimmed = contact.trim();
    if (!trimmed || trimmed.length < 5) {
      setError(
        contactType === 'email'
          ? 'Please enter a valid email address.'
          : 'Please enter a valid WhatsApp number with country code.'
      );
      return;
    }
    if (contactType === 'email' && !trimmed.includes('@')) {
      setError('Please enter a valid email address (e.g., name@example.com).');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/leads/curriculum`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          contact: trimmed,
          contactType,
          pageSource,
        }),
      });
      const json = await res.json().catch(() => null);
      trackCurriculumLead({ contactType, pageSource });
      setUnlocked(true);
      triggerDownload(json?.data?.downloadUrl || PDF_URL);
    } catch {
      // Never leave the visitor blocked if API is unreachable
      trackCurriculumLead({ contactType, pageSource });
      setUnlocked(true);
      triggerDownload(PDF_URL);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="conv-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Download 42-Page Curriculum PDF">
      <div className="conv-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <button type="button" className="conv-modal-close" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        {!unlocked ? (
          <>
            <div className="conv-modal-header">
              <span className="conv-modal-eyebrow">Free 42-Page Academic Guide</span>
              <h2>Get the Full <span className="text-gold">Curriculum PDF</span></h2>
              <p>
                Enter your email or WhatsApp number to instantly unlock our complete 42-page roadmap covering Qur&apos;an, Arabic, and Islamic Studies.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="conv-modal-group">
                <label className="conv-modal-label">How would you like to receive updates?</label>
                <div className="conv-modal-plan-grid">
                  <button
                    type="button"
                    className={`conv-choice-btn ${contactType === 'email' ? 'active' : ''}`}
                    onClick={() => { setContactType('email'); setContact(''); setError(''); }}
                  >
                    <span className="conv-choice-title">Email Address</span>
                    <span className="conv-choice-sub">Instant PDF download</span>
                  </button>
                  <button
                    type="button"
                    className={`conv-choice-btn ${contactType === 'whatsapp' ? 'active' : ''}`}
                    onClick={() => { setContactType('whatsapp'); setContact(''); setError(''); }}
                  >
                    <span className="conv-choice-title">WhatsApp Number</span>
                    <span className="conv-choice-sub">Instant PDF download</span>
                  </button>
                </div>
              </div>

              <div className="conv-modal-group">
                <label htmlFor="lead-name" className="conv-modal-label">Your Name (Optional)</label>
                <input
                  id="lead-name"
                  type="text"
                  placeholder="e.g., Sarah"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="conv-modal-group">
                <label htmlFor="lead-contact" className="conv-modal-label">
                  {contactType === 'email' ? 'Email Address *' : 'WhatsApp Number (with country code) *'}
                </label>
                <input
                  id="lead-contact"
                  type={contactType === 'email' ? 'email' : 'tel'}
                  placeholder={contactType === 'email' ? 'you@example.com' : '+1 555 123 4567'}
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  required
                />
              </div>

              {error && <p className="paypal-error-note" style={{ marginBottom: '12px' }}>{error}</p>}

              <button
                type="submit"
                className="btn btn-primary btn-lg btn-block"
                disabled={loading}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <FileText size={18} />
                {loading ? 'Preparing Your PDF…' : 'Unlock & Download 42-Page PDF'}
              </button>

              <p className="paypal-card-hint" style={{ marginTop: '10px' }}>
                No spam — only helpful guidance for your Qur&apos;an learning journey.
              </p>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '16px 4px' }}>
            <div style={{ color: '#5ee694', marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>
              <CheckCircle size={48} />
            </div>
            <h2 style={{ marginBottom: '8px' }}>Your Curriculum Is <span className="text-gold">Ready!</span></h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '20px', fontSize: '0.95rem' }}>
              Your download should start automatically. If it didn&apos;t, tap the button below.
            </p>
            <a
              href={PDF_URL}
              download="Fosselat_Academy_Curriculum_Framework.pdf"
              className="btn btn-primary btn-lg"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <Download size={18} />
              Download Curriculum PDF (42 Pages)
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
