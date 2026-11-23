import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './LegalPages.css';

export default function Terms() {
  useEffect(() => {
    document.title = 'Terms & Conditions — Fosselat Academy';
  }, []);

  return (
    <div className="page-enter">
      <section className="legal-hero">
        <div className="container">
          <h1>Terms &amp; <span className="text-gold">Conditions</span></h1>
          <p>Clear, fair guidelines for students, parents, and families learning with Fosselat Academy.</p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: '860px' }}>
          <div className="legal-body-card">
            <div className="legal-updated">Last Updated: November 2026</div>

            <div className="legal-section">
              <h2>1. Services Overview</h2>
              <p>
                Fosselat Academy provides live, 1-on-1 online educational classes in Qur&apos;an reading, Tajweed, memorization (Hifz), Arabic language, and Islamic Studies for adults and children worldwide via Zoom and Google Meet.
              </p>
            </div>

            <div className="legal-section">
              <h2>2. Free Trial Class</h2>
              <p>
                Every new student is eligible for one complimentary 30-minute trial class prior to purchasing a monthly plan. No payment details are required to book a free trial.
              </p>
            </div>

            <div className="legal-section">
              <h2>3. Monthly Plans &amp; Billing Cycle</h2>
              <ul>
                <li>Plans are structured on a 4-week monthly cycle based on the weekly frequency (2, 3, 4, or 5 classes per week) and duration (30 to 120 minutes) you select.</li>
                <li>Multi-class plan discounts (5% Growth, 7% Excellence, 10% Elite) are automatically applied at checkout.</li>
                <li>All payments are processed securely in USD via PayPal (supporting PayPal accounts as well as Visa / Mastercard debit and credit cards).</li>
              </ul>
            </div>

            <div className="legal-section">
              <h2>4. Scheduling, Rescheduling &amp; Attendance</h2>
              <ul>
                <li>Class schedules are agreed upon directly with our coordination team according to your local time zone.</li>
                <li>If you need to reschedule a class, please notify your teacher or our coordination team on WhatsApp at least 4 hours in advance whenever possible so we can arrange a make-up session.</li>
                <li>Students who miss a scheduled class without prior notice may have that session counted as attended, except in emergencies communicated promptly.</li>
              </ul>
            </div>

            <div className="legal-section">
              <h2>5. Free Teacher Switching</h2>
              <p>
                Your comfort and progress come first. You may request to switch to another male or female teacher at any time at no extra cost by contacting our support team.
              </p>
            </div>

            <div className="legal-section">
              <h2>6. Refunds &amp; 30-Day Money-Back Guarantee</h2>
              <p>
                Every new enrollment is covered by our transparent 30-Day Money-Back Guarantee. Please review our full <Link to="/refund-policy">Refund Policy</Link> for complete details.
              </p>
            </div>

            <div className="legal-section">
              <h2>7. Contact</h2>
              <p>
                For questions regarding these Terms, contact us at <a href="mailto:support@fosselatacademy.com">support@fosselatacademy.com</a> or on WhatsApp at <a href="https://wa.me/966595796177" target="_blank" rel="noopener noreferrer">+966 59 579 6177</a>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
