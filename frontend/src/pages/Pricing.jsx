import { useEffect } from 'react';
import PricingBuilder from '../components/PricingBuilder';
import ReviewsSection from '../components/ReviewsSection';
import './Pricing.css';

export default function Pricing() {
  useEffect(() => {
    document.title = 'Pricing & Plans — Fosselat Academy';
  }, []);

  return (
    <div className="page-enter">
      <section className="page-hero">
        <div className="page-hero-overlay" />
        <div className="container page-hero-content">
          <h1>Transparent <span className="text-gold">Pricing</span></h1>
          <p>
            Choose your weekly schedule and class duration to see your live monthly total, PayPal &amp; Card checkout, and payment steps.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <PricingBuilder defaultPlan="growth" defaultDuration={30} pageSource="Pricing" />
        </div>
      </section>

      <ReviewsSection limit={3} altBg={true} id="pricing-reviews" />
    </div>
  );
}
