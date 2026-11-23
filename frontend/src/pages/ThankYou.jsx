import { useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, MessageCircle, ShieldCheck, Calendar } from 'lucide-react';
import { buildWhatsAppUrl, trackPurchase, trackWhatsAppClick } from '../utils/siteActions';
import './LegalPages.css';

export default function ThankYou() {
  const [searchParams] = useSearchParams();
  const trackedRef = useRef(false);

  let storedOrder = null;
  try {
    const raw = sessionStorage.getItem('fosselat_last_order');
    if (raw) storedOrder = JSON.parse(raw);
  } catch {}

  const orderId = searchParams.get('order') || storedOrder?.orderId || '';
  const planName = searchParams.get('plan') || storedOrder?.planName || 'Monthly Plan';
  const duration = searchParams.get('duration') || String(storedOrder?.duration || 30);
  const amount = searchParams.get('amount') || storedOrder?.amount || '';
  const source = searchParams.get('source') || storedOrder?.pageSource || 'Website';

  useEffect(() => {
    document.title = 'Thank You for Enrolling — Fosselat Academy';

    if (!trackedRef.current && (orderId || amount)) {
      trackedRef.current = true;
      trackPurchase({
        orderId,
        amount,
        planName,
        duration: Number(duration) || 30,
        pageSource: source,
      });
    }
  }, [orderId, amount, planName, duration, source]);

  const scheduleWhatsAppUrl = buildWhatsAppUrl({
    page: 'Thank You',
    intent: 'post_payment',
    orderId: orderId || 'Confirmed',
    planName,
    duration,
    monthlyTotal: amount,
  });

  return (
    <div className="page-enter">
      <section className="legal-hero">
        <div className="container" style={{ maxWidth: '720px' }}>
          <div className="ty-check-circle">
            <CheckCircle size={48} />
          </div>
          <h1>Jazakum Allahu Khairan — <span className="text-gold">You&apos;re Enrolled!</span></h1>
          <p>
            Your payment has been received securely. We are excited to welcome you to Fosselat Academy.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: '720px' }}>
          <div className="ty-card">
            {(orderId || amount) && (
              <div className="ty-receipt">
                <h3>Enrollment Summary</h3>
                {orderId && (
                  <div className="ty-receipt-row">
                    <span>Order Reference</span>
                    <strong>{orderId}</strong>
                  </div>
                )}
                <div className="ty-receipt-row">
                  <span>Selected Plan</span>
                  <strong>{planName} ({duration} min / class)</strong>
                </div>
                {amount && (
                  <div className="ty-receipt-row">
                    <span>Amount Paid</span>
                    <strong className="text-gold">${amount} USD</strong>
                  </div>
                )}
              </div>
            )}

            <div className="ty-next-steps">
              <h3><Calendar size={20} /> What Happens Next?</h3>
              <ol>
                <li>
                  <strong>Schedule Your First Class Right Away on WhatsApp:</strong> Tap the green button below to send your order reference directly to our team on WhatsApp and pick your preferred days, local time zone, and teacher preference (male or female) right away.
                </li>
                <li>
                  <strong>Confirm Your Starting Level:</strong> If you haven&apos;t taken our free 3–5 minute placement check yet, you can take it now or during your first session.
                </li>
                <li>
                  <strong>Begin Your 1-on-1 Classes:</strong> You&apos;ll receive your personal student portal access and Zoom / Google Meet class schedule.
                </li>
              </ol>
            </div>

            <div className="ty-cta-box">
              <p>Want to pick your first class slot right now? Tap below to message us with your order reference pre-filled:</p>
              <a
                href={scheduleWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="pb-whatsapp-btn"
                onClick={() => trackWhatsAppClick('thank_you_schedule', { order_id: orderId })}
              >
                <MessageCircle size={20} />
                Schedule My First Class on WhatsApp
              </a>
            </div>

            <div className="pb-guarantee-strip" style={{ marginTop: '22px' }}>
              <ShieldCheck size={17} />
              <span>Your enrollment is backed by our 30-Day Money-Back Guarantee &amp; Free Teacher Switching.</span>
            </div>

            <div style={{ textAlign: 'center', marginTop: '24px', display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/placement-tests" className="btn btn-outline">Take Free Placement Test</Link>
              <Link to="/" className="btn btn-outline">Return to Home</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
