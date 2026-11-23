import { Link } from 'react-router-dom';
import { CreditCard, CalendarCheck, ShieldCheck } from 'lucide-react';
import './SharedSections.css';

export default function HowToPaySection({ compact = false }) {
  const steps = [
    {
      num: '1',
      icon: <CalendarCheck size={24} />,
      title: 'Choose your plan & see your monthly total',
      desc: 'Select how many classes per week and the class length that fits your schedule. Your exact 4-week monthly total updates immediately with all discounts applied.',
    },
    {
      num: '2',
      icon: <CreditCard size={24} />,
      title: 'Pay securely with PayPal — or message us on WhatsApp first',
      desc: 'Complete your enrollment directly using PayPal or any Visa / Mastercard debit or credit card (no PayPal account required). Prefer to ask a question or take a free trial first? Tap WhatsApp anytime.',
    },
    {
      num: '3',
      icon: <ShieldCheck size={24} />,
      title: 'Not satisfied? Full refund within 30 days',
      desc: 'After payment, we confirm your schedule on WhatsApp and match you with your certified teacher. Every enrollment is covered by our transparent 30-day money-back guarantee.',
    },
  ];

  return (
    <section className={`how-to-pay-section ${compact ? 'compact' : ''}`} id="how-to-pay">
      <div className="container">
        <div className="section-title">
          <h2>How Do I <span className="text-gold">Pay</span>?</h2>
          <div className="gold-line" />
          <p>Simple, transparent checkout in three clear steps — with zero hidden fees.</p>
        </div>

        <div className="htp-grid">
          {steps.map((s) => (
            <div className="htp-card" key={s.num}>
              <div className="htp-card-top">
                <span className="htp-step-badge">Step {s.num}</span>
                <span className="htp-icon">{s.icon}</span>
              </div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="htp-footer-note">
          <span>Questions about billing or refunds? Read our </span>
          <Link to="/refund-policy">30-Day Refund Policy</Link>.
        </div>
      </div>
    </section>
  );
}
