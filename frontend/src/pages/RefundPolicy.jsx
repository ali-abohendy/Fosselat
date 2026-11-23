import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './LegalPages.css';

export default function RefundPolicy() {
  useEffect(() => {
    document.title = '30-Day Money-Back Guarantee & Refund Policy — Fosselat Academy';
  }, []);

  return (
    <div className="page-enter">
      <section className="legal-hero">
        <div className="container">
          <h1>30-Day <span className="text-gold">Refund Policy</span></h1>
          <p>Our transparent 30-Day Money-Back Guarantee so you can enroll with complete confidence.</p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: '860px' }}>
          <div className="legal-body-card">
            <div className="legal-updated">Last Updated: November 2026</div>

            <div className="legal-section">
              <h2>1. Our 30-Day Money-Back Guarantee</h2>
              <p>
                We stand behind the quality of our teachers and curriculum. If you enroll in any monthly plan at Fosselat Academy and are not satisfied with your learning experience for any reason, you are entitled to a <strong>full refund within 30 calendar days</strong> of your initial payment date.
              </p>
            </div>

            <div className="legal-section">
              <h2>2. Free Teacher Switch First (Optional)</h2>
              <p>
                If you love the program but prefer a different teaching style, schedule, or gender preference, we are always happy to switch your teacher at zero extra cost — with no impact on your 30-day guarantee window.
              </p>
            </div>

            <div className="legal-section">
              <h2>3. How to Request a Refund</h2>
              <ul>
                <li>Send us a message on WhatsApp at <a href="https://wa.me/966595796177" target="_blank" rel="noopener noreferrer">+966 59 579 6177</a> or email <a href="mailto:support@fosselatacademy.com">support@fosselatacademy.com</a> within 30 days of your payment.</li>
                <li>Include your name and PayPal order reference (or the email used at checkout).</li>
                <li>No complicated forms or pressure — our team confirms your refund request within 24 hours.</li>
              </ul>
            </div>

            <div className="legal-section">
              <h2>4. Refund Processing Time</h2>
              <p>
                Approved refunds are issued back to your original PayPal account or debit/credit card within <strong>3–5 business days</strong> (depending on your card issuer or PayPal processing times).
              </p>
            </div>

            <div className="legal-section">
              <h2>5. Ready to Try Risk-Free?</h2>
              <p>
                You can also start with a complimentary 30-minute trial class before paying anything. View our transparent plans on the <Link to="/pricing">Pricing page</Link>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
