import { useState, useEffect } from 'react';
import { X, MessageCircle, ShieldCheck } from 'lucide-react';
import { PLANS, DURATIONS, calculateMonthlyPlan } from '../data/pricingData';
import { buildWhatsAppUrl, trackWhatsAppClick } from '../utils/siteActions';
import PayPalCheckoutButton from './PayPalCheckoutButton';
import './SharedSections.css';

export default function EnrollModal({ isOpen, onClose, pageSource = 'Home Modal' }) {
  const [planId, setPlanId] = useState('growth');
  const [duration, setDuration] = useState(30);

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

  const pricing = calculateMonthlyPlan(planId, duration);
  const whatsappUrl = buildWhatsAppUrl({
    page: pageSource,
    intent: 'enroll',
    planName: pricing?.planName,
    classesPerWeek: pricing?.classesPerWeek,
    duration: pricing?.duration,
    monthlyTotal: pricing?.total,
  });

  return (
    <div className="conv-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Enroll in Fosselat Academy">
      <div className="conv-modal-card" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="conv-modal-close" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        <div className="conv-modal-header">
          <span className="conv-modal-eyebrow">1-on-1 Live Online Classes</span>
          <h2>Enroll in <span className="text-gold">Fosselat Academy</span></h2>
          <p>Select your weekly schedule and class duration to see your exact monthly total.</p>
        </div>

        {/* Plan Selector — High Contrast Buttons */}
        <div className="conv-modal-group">
          <label className="conv-modal-label">1. Select Weekly Plan</label>
          <div className="conv-modal-plan-grid">
            {PLANS.map((p) => {
              const active = planId === p.id;
              return (
                <button
                  type="button"
                  key={p.id}
                  className={`conv-choice-btn ${active ? 'active' : ''}`}
                  onClick={() => setPlanId(p.id)}
                >
                  <span className="conv-choice-title">{p.name}</span>
                  <span className="conv-choice-sub">{p.classes} classes/week</span>
                  {p.discount > 0 && (
                    <span className="conv-choice-badge">{Math.round(p.discount * 100)}% OFF</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Duration Selector — High Contrast Pills */}
        <div className="conv-modal-group">
          <label className="conv-modal-label">2. Select Class Duration</label>
          <div className="conv-modal-dur-grid">
            {DURATIONS.map((d) => {
              const active = duration === d.minutes;
              return (
                <button
                  type="button"
                  key={d.minutes}
                  className={`conv-dur-pill ${active ? 'active' : ''}`}
                  onClick={() => setDuration(d.minutes)}
                >
                  <strong>{d.minutes} min</strong>
                  <span>${d.rate.toFixed(2)}/class</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Instant Price Summary inside modal */}
        {pricing && (
          <div className="conv-modal-summary">
            <div className="conv-modal-summary-row">
              <span>{pricing.planName} · {pricing.monthlyClasses} classes/month ({pricing.duration} min)</span>
              {pricing.hasDiscount && (
                <span className="pb-price-old">${pricing.base}</span>
              )}
            </div>
            <div className="conv-modal-summary-total">
              <span>Monthly Total:</span>
              <span className="text-gold">${pricing.total} / month</span>
            </div>
            {pricing.hasDiscount && (
              <div className="conv-modal-summary-save">
                Includes {pricing.discountPct}% discount (-${pricing.discount})
              </div>
            )}
          </div>
        )}

        {/* Direct PayPal / Card Checkout + WhatsApp */}
        {pricing && (
          <div className="conv-modal-actions">
            <PayPalCheckoutButton
              planId={pricing.planId}
              planName={pricing.planName}
              duration={pricing.duration}
              monthlyTotal={pricing.total}
              pageSource={pageSource}
              onSuccess={onClose}
            />

            <div className="pb-divider-or">
              <span>or enroll via WhatsApp</span>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="pb-whatsapp-btn"
              onClick={() =>
                trackWhatsAppClick('enroll_modal', {
                  plan_name: pricing.planName,
                  duration: pricing.duration,
                  value: Number(pricing.total),
                })
              }
            >
              <MessageCircle size={19} />
              Chat &amp; Enroll on WhatsApp
            </a>

            <div className="pb-guarantee-strip">
              <ShieldCheck size={15} />
              <span>Free Trial Available · 30-Day Money-Back Guarantee</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
