import { useEffect } from 'react';
import './LegalPages.css';

export default function PrivacyPolicy() {
  useEffect(() => {
    document.title = 'Privacy Policy — Fosselat Academy';
  }, []);

  return (
    <div className="page-enter">
      <section className="legal-hero">
        <div className="container">
          <h1>Privacy <span className="text-gold">Policy</span></h1>
          <p>How Fosselat Academy collects, protects, and respects your family&apos;s personal information.</p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: '860px' }}>
          <div className="legal-body-card">
            <div className="legal-updated">Last Updated: November 2026</div>

            <div className="legal-section">
              <h2>1. Information We Collect</h2>
              <p>When you book a trial, take a placement test, download our curriculum, or enroll in classes, we may collect:</p>
              <ul>
                <li>Contact details you voluntarily provide (name, email address, WhatsApp/phone number, time zone).</li>
                <li>Learning details needed to personalize classes (student age group, placement test results, course track, and schedule preferences).</li>
                <li>Payment confirmation references returned by PayPal (transaction ID, payer name, email, and plan purchased).</li>
              </ul>
            </div>

            <div className="legal-section">
              <h2>2. Payment Security</h2>
              <p>
                We never store your credit card, debit card, or PayPal password on our servers. All transactions are processed directly over encrypted connections by PayPal.
              </p>
            </div>

            <div className="legal-section">
              <h2>3. How We Use Your Information</h2>
              <ul>
                <li>To schedule your free trial and ongoing 1-on-1 classes and match you with an appropriate teacher.</li>
                <li>To share your placement test results, curriculum guides, and progress updates.</li>
                <li>To provide customer support and process refund requests under our 30-Day Money-Back Guarantee.</li>
                <li>To understand website performance and improve our admissions experience using analytics (Google Tag Manager).</li>
              </ul>
            </div>

            <div className="legal-section">
              <h2>4. Children&apos;s Privacy</h2>
              <p>
                Accounts and enrollments for children under 16 are arranged by a parent or legal guardian. We never sell, rent, or share student or parent data with third-party marketers.
              </p>
            </div>

            <div className="legal-section">
              <h2>5. Your Rights &amp; Data Deletion</h2>
              <p>
                You may request access to, correction of, or deletion of your personal contact details at any time by emailing <a href="mailto:support@fosselatacademy.com">support@fosselatacademy.com</a> or messaging <a href="https://wa.me/966595796177" target="_blank" rel="noopener noreferrer">+966 59 579 6177</a> on WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
