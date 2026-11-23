import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { X, Send } from 'lucide-react';
import { buildWhatsAppUrl, trackWhatsAppClick } from '../utils/siteActions';
import './WhatsAppButton.css';

const PAGE_LABELS = {
  '/': 'Home',
  '/pricing': 'Pricing',
  '/curriculum': 'Curriculum',
  '/teachers': 'Teachers',
  '/about': 'About Us',
  '/contact': 'Contact',
  '/placement-tests': 'Placement Tests',
  '/learn-quran-from-zero': 'LP-1 Beginners',
  '/thank-you': 'Thank You',
};

const WhatsAppSvg = ({ size = 24 }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default function WhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false);
  const widgetRef = useRef(null);
  const location = useLocation();
  const pageName = PAGE_LABELS[location.pathname] || location.pathname;

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (widgetRef.current && !widgetRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen]);

  const adultUrl = buildWhatsAppUrl({
    page: pageName,
    customText: `Assalamu alaikum! I'm interested in learning the Quran — the lessons are for myself.`,
  });

  const childUrl = buildWhatsAppUrl({
    page: pageName,
    customText: `Assalamu alaikum! I'm interested in learning the Quran — the lessons are for my child.`,
  });

  const generalUrl = buildWhatsAppUrl({ page: pageName, intent: 'general' });

  return (
    <div className="wa-widget" ref={widgetRef}>
      {/* Chat Popup Card */}
      {isOpen && (
        <div className="wa-popup" role="dialog" aria-label="Contact Fosselat Academy on WhatsApp">
          <div className="wa-popup-header">
            <div className="wa-popup-brand">
              <div className="wa-popup-avatar">
                <img src="/logo.png" alt="Fosselat Academy" />
                <span className="wa-online-dot" aria-hidden="true" />
              </div>
              <div>
                <div className="wa-popup-title">Fosselat Academy</div>
                <div className="wa-popup-status">Online · Ready to help</div>
              </div>
            </div>
            <button
              type="button"
              className="wa-popup-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close WhatsApp popup"
            >
              <X size={17} />
            </button>
          </div>

          <div className="wa-popup-body">
            <div className="wa-bubble">
              <p className="wa-bubble-greeting">Assalamu alaikum! Welcome to Fosselat Academy.</p>
              <p>
                We&apos;re here to help you find the right starting point for learning the Quran. Are the lessons for you or your child?
              </p>
            </div>

            <div className="wa-quick-replies">
              <a
                href={adultUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="wa-quick-btn"
                onClick={() => {
                  trackWhatsAppClick('floating_popup_adult', { page_name: pageName });
                  setIsOpen(false);
                }}
              >
                <span>For Myself (Adult)</span>
                <Send size={14} />
              </a>

              <a
                href={childUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="wa-quick-btn"
                onClick={() => {
                  trackWhatsAppClick('floating_popup_child', { page_name: pageName });
                  setIsOpen(false);
                }}
              >
                <span>For My Child</span>
                <Send size={14} />
              </a>
            </div>
          </div>

          <div className="wa-popup-footer">
            <a
              href={generalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="wa-start-chat-btn"
              onClick={() => {
                trackWhatsAppClick('floating_popup_general', { page_name: pageName });
                setIsOpen(false);
              }}
            >
              <WhatsAppSvg size={18} />
              <span>Start Chat on WhatsApp</span>
            </a>
          </div>
        </div>
      )}

      {/* Floating Trigger with "Contact Us" Pill */}
      <button
        type="button"
        className={`wa-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label="Contact us on WhatsApp"
      >
        <span className="wa-trigger-label">Contact Us</span>
        <span className="wa-trigger-circle">
          {isOpen ? <X size={22} /> : <WhatsAppSvg size={24} />}
        </span>
      </button>
    </div>
  );
}
