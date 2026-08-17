import { useState, useEffect } from 'react';
import Button from '../components/Button';
import { Leaf, BookOpen, Star, Trophy, Clock } from '../components/Icons';
import './Pricing.css';

const WHATSAPP_BASE = 'https://wa.me/966595796177';
const WHATSAPP_TRIAL = 'https://wa.me/966595796177?text=Assalam%20alikom%20warahmatuallah%20wabarakatu.%20I%20want%20to%20book%20a%20Free%20trial%20lesson,%20please.';

const PLANS = [
  { id: 'starter', name: 'Starter', icon: <Leaf size={32} color="#4ade80" />, classes: 2, desc: 'Perfect for steady progress.' },
  { id: 'growth', name: 'Growth', icon: <BookOpen size={32} color="#60a5fa" />, classes: 3, desc: 'Balanced learning and consistent improvement.', popular: true },
  { id: 'excellence', name: 'Excellence', icon: <Star size={32} color="#f472b6" />, classes: 4, desc: 'Faster progress and greater achievement.' },
  { id: 'elite', name: 'Elite', icon: <Trophy size={32} color="var(--color-gold)" />, classes: 5, desc: 'Maximum progress and intensive learning.', discount: 0.10 },
];

const DURATIONS = [
  { minutes: 30, rate: 5 },
  { minutes: 40, rate: 6.67 },
  { minutes: 45, rate: 7.5 },
  { minutes: 60, rate: 10 },
  { minutes: 90, rate: 15 },
  { minutes: 120, rate: 20 },
];

export default function Pricing() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(null);

  useEffect(() => { document.title = 'Pricing — Fosselat Academy'; }, []);

  const calculateMonthly = () => {
    if (!selectedPlan || !selectedDuration) return null;
    const plan = PLANS.find(p => p.id === selectedPlan);
    const dur = DURATIONS.find(d => d.minutes === selectedDuration);
    if (!plan || !dur) return null;
    const base = plan.classes * 4 * dur.rate;
    const discount = plan.discount ? base * plan.discount : 0;
    return { base: base.toFixed(2), discount: discount.toFixed(2), total: (base - discount).toFixed(2), hasDiscount: !!plan.discount };
  };

  const pricing = calculateMonthly();

  return (
    <div className="page-enter">
      <section className="page-hero">
        <div className="page-hero-overlay" />
        <div className="container page-hero-content">
          <h1>Our <span className="text-gold">Pricing</span></h1>
          <p>Build your personalized learning plan in 2 simple steps</p>
        </div>
      </section>

      <section className="section">
        <div className="container">

          {/* Step 1: Schedule */}
          <div className="pricing-step">
            <div className="pricing-step-header">
              <span className="pricing-step-num">1</span>
              <h2>Choose Your Schedule</h2>
            </div>
            <div className="pricing-plans-grid">
              {PLANS.map(p => (
                <div key={p.id}
                  className={`pricing-plan-card ${selectedPlan === p.id ? 'selected' : ''} ${p.popular ? 'popular' : ''}`}
                  onClick={() => setSelectedPlan(p.id)}>
                  {p.popular && <div className="plan-badge">⭐ Most Popular</div>}
                  {p.discount && <div className="plan-badge plan-badge-discount">10% OFF</div>}
                  <div className="plan-icon">{p.icon}</div>
                  <h3>{p.name}</h3>
                  <div className="plan-classes">{p.classes} Classes / Week</div>
                  <p className="plan-desc">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: Duration */}
          <div className="pricing-step">
            <div className="pricing-step-header">
              <span className="pricing-step-num">2</span>
              <h2>Choose Class Duration</h2>
            </div>
            <div className="pricing-durations-grid">
              {DURATIONS.map(d => (
                <div key={d.minutes}
                  className={`pricing-duration-card ${selectedDuration === d.minutes ? 'selected' : ''}`}
                  onClick={() => setSelectedDuration(d.minutes)}>
                  <div className="duration-time">{d.minutes} min</div>
                  <div className="duration-rate">${d.rate.toFixed(2)}<span>/class</span></div>
                </div>
              ))}
            </div>
          </div>

          {/* Price Summary */}
          {pricing && (
            <div className="pricing-summary">
              <div className="pricing-summary-inner">
                <h3>Your Monthly Plan</h3>
                <div className="summary-details">
                  <div className="summary-row">
                    <span>Schedule:</span>
                    <span>{PLANS.find(p => p.id === selectedPlan)?.classes} classes/week</span>
                  </div>
                  <div className="summary-row">
                    <span>Duration:</span>
                    <span>{selectedDuration} min/class</span>
                  </div>
                  <div className="summary-row">
                    <span>Monthly classes:</span>
                    <span>{PLANS.find(p => p.id === selectedPlan)?.classes * 4}</span>
                  </div>
                  {pricing.hasDiscount && (
                    <>
                      <div className="summary-row">
                        <span>Subtotal:</span>
                        <span className="price-strike">${pricing.base}</span>
                      </div>
                      <div className="summary-row summary-discount">
                        <span>Elite Discount (10%):</span>
                        <span>-${pricing.discount}</span>
                      </div>
                    </>
                  )}
                  <div className="summary-row summary-total">
                    <span>Monthly Total:</span>
                    <span>${pricing.total}/mo</span>
                  </div>
                </div>
                <div className="summary-actions">
                  <Button href={`${WHATSAPP_BASE}?text=${encodeURIComponent(`Assalam alikom warahmatuallah wabarakatu, I would like to enroll in Fosselat Academy. Plan: ${PLANS.find(p => p.id === selectedPlan)?.name}, Duration: ${selectedDuration} min`)}`} variant="primary" size="lg">
                    Enroll Now
                  </Button>
                  <Button href={WHATSAPP_TRIAL} variant="outline" size="lg">
                    Book a Free Trial
                  </Button>
                </div>
              </div>
            </div>
          )}

        </div>
      </section>
    </div>
  );
}
