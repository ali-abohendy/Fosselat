import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, MessageCircle, Check } from 'lucide-react';
import { Leaf, BookOpen, Star, Trophy } from './Icons';
import { PLANS, DURATIONS, calculateMonthlyPlan } from '../data/pricingData';
import { buildWhatsAppUrl, trackWhatsAppClick } from '../utils/siteActions';
import PayPalCheckoutButton from './PayPalCheckoutButton';
import './SharedSections.css';

const PLAN_ICONS = {
  starter: <Leaf size={24} color="#4ade80" />,
  growth: <BookOpen size={24} color="#60a5fa" />,
  excellence: <Star size={24} color="#f472b6" />,
  elite: <Trophy size={24} color="var(--color-gold)" />,
};

export default function PricingBuilder({
  defaultPlan = 'growth',
  defaultDuration = 30,
  pageSource = 'Pricing',
}) {
  const [selectedPlan, setSelectedPlan] = useState(defaultPlan);
  const [selectedDuration, setSelectedDuration] = useState(defaultDuration);

  const pricing = calculateMonthlyPlan(selectedPlan, selectedDuration);

  const whatsappUrl = buildWhatsAppUrl({
    page: pageSource,
    intent: 'question_plan',
    planName: pricing?.planName,
    classesPerWeek: pricing?.classesPerWeek,
    duration: pricing?.duration,
    monthlyTotal: pricing?.total,
  });

  return (
    <div className="pb-split-layout" id="checkout-summary">
      {/* LEFT COLUMN: Interactive Step 1 + Step 2 Buttons + Compact How to Pay */}
      <div className="pb-selectors-col">
        {/* Step 1: Schedule */}
        <div className="pb-step-block">
          <div className="pricing-step-header">
            <span className="pricing-step-num">1</span>
            <div>
              <h2>Choose Your Weekly Schedule</h2>
              <p className="pb-step-sub">Tap a plan below — more weekly classes unlock 5% to 10% monthly savings.</p>
            </div>
          </div>

          <div className="pb-plan-btn-grid">
            {PLANS.map((p) => {
              const isSelected = selectedPlan === p.id;
              return (
                <button
                  type="button"
                  key={p.id}
                  className={`pb-selectable-plan ${isSelected ? 'selected' : ''} ${p.popular ? 'popular' : ''}`}
                  onClick={() => setSelectedPlan(p.id)}
                  aria-pressed={isSelected}
                >
                  <div className="pb-card-top-row">
                    <span className="pb-plan-mini-icon">{PLAN_ICONS[p.id]}</span>
                    <div className="pb-top-tags">
                      {p.popular && <span className="pb-tag-popular">Most Popular</span>}
                      {p.discount > 0 && (
                        <span className="pb-tag-discount">{Math.round(p.discount * 100)}% OFF</span>
                      )}
                    </div>
                    <span className={`pb-radio-dot ${isSelected ? 'checked' : ''}`} aria-hidden="true">
                      {isSelected && <Check size={13} strokeWidth={3} />}
                    </span>
                  </div>

                  <div className="pb-plan-card-body">
                    <h3>{p.name}</h3>
                    <div className="pb-plan-freq">{p.classes} Classes / Week</div>
                    <div className="pb-plan-monthly-note">{p.classes * 4} classes / month</div>
                    <p className="pb-plan-desc">{p.desc}</p>
                  </div>

                  <div className={`pb-card-action-pill ${isSelected ? 'active' : ''}`}>
                    {isSelected ? (
                      <>
                        <Check size={15} strokeWidth={3} /> Selected
                      </>
                    ) : (
                      'Select Plan'
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Duration */}
        <div className="pb-step-block">
          <div className="pricing-step-header">
            <span className="pricing-step-num">2</span>
            <div>
              <h2>Choose Class Duration</h2>
              <p className="pb-step-sub">Tap your preferred 1-on-1 lesson length (4-week monthly billing).</p>
            </div>
          </div>

          <div className="pb-dur-btn-grid">
            {DURATIONS.map((d) => {
              const isSelected = selectedDuration === d.minutes;
              return (
                <button
                  type="button"
                  key={d.minutes}
                  className={`pb-tactile-dur-btn ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedDuration(d.minutes)}
                  aria-pressed={isSelected}
                >
                  <span className={`pb-radio-dot pb-radio-sm ${isSelected ? 'checked' : ''}`} aria-hidden="true">
                    {isSelected && <Check size={11} strokeWidth={3} />}
                  </span>
                  <span className="pb-dur-mins">{d.minutes} min</span>
                  <span className="pb-dur-rate">${d.rate.toFixed(2)}/class</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Inline Compact "How Do I Pay?" Guide — Visible right alongside payment! */}
        <div className="pb-inline-htp" id="how-to-pay">
          <h3>How Do I Pay?</h3>
          <div className="pb-inline-htp-steps">
            <div className="pb-htp-mini">
              <span className="pb-htp-num">1</span>
              <div>
                <strong>Pick Your Plan</strong>
                <p>Choose weekly classes &amp; duration to see your instant monthly total.</p>
              </div>
            </div>
            <div className="pb-htp-mini">
              <span className="pb-htp-num">2</span>
              <div>
                <strong>Pay via PayPal or Card</strong>
                <p>Use PayPal or any Visa / Mastercard directly (no PayPal account needed), or chat on WhatsApp first.</p>
              </div>
            </div>
            <div className="pb-htp-mini">
              <span className="pb-htp-num">3</span>
              <div>
                <strong>Instant Confirmation</strong>
                <p>Schedule your first class right away — backed by our <Link to="/refund-policy">30-Day Refund Guarantee</Link>.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN (STICKY): Live Total + PayPal / Card Buttons + WhatsApp */}
      {pricing && (
        <aside className="pb-sticky-checkout">
          <div className="pb-checkout-card pb-checkout-card-compact">
            <div className="pb-checkout-top-badge">
              {selectedPlan === 'growth' ? 'Most Popular' : pricing.planName}
              {pricing.hasDiscount ? ` · ${pricing.discountPct}% OFF Applied` : ' · 4-Week Cycle'}
            </div>

            <h3 className="pb-plan-headline">{pricing.planName} Plan</h3>
            <p className="pb-plan-subline">
              {pricing.classesPerWeek} classes/week · {pricing.duration} min · {pricing.monthlyClasses} classes/mo
            </p>

            <div className="pb-price-display">
              {pricing.hasDiscount && (
                <span className="pb-price-old">${pricing.base}</span>
              )}
              <div className="pb-price-final">
                <span className="pb-currency">$</span>
                <span className="pb-amount">{pricing.total}</span>
                <span className="pb-period">/ month</span>
              </div>
              {pricing.hasDiscount && (
                <span className="pb-savings-tag">
                  You save ${pricing.discount} ({pricing.discountPct}% multi-class discount)
                </span>
              )}
            </div>

            <PayPalCheckoutButton
              planId={pricing.planId}
              planName={pricing.planName}
              duration={pricing.duration}
              monthlyTotal={pricing.total}
              pageSource={pageSource}
            />

            <div className="pb-divider-or">
              <span>or ask us first</span>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="pb-whatsapp-btn"
              onClick={() =>
                trackWhatsAppClick(`${pageSource.toLowerCase()}_pricing_card`, {
                  plan_name: pricing.planName,
                  duration: pricing.duration,
                  value: Number(pricing.total),
                })
              }
            >
              <MessageCircle size={19} />
              Chat on WhatsApp Before Paying
            </a>

            <ul className="pb-included-list pb-included-compact">
              <li><Check size={15} /> 1-on-1 live classes taught in clear English</li>
              <li><Check size={15} /> Free 30-min trial &amp; free teacher switching</li>
              <li><Check size={15} /> Full 30-day money-back guarantee</li>
            </ul>

            <div className="pb-guarantee-strip">
              <ShieldCheck size={16} />
              <span>Protected by our 30-Day Money-Back Guarantee</span>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
