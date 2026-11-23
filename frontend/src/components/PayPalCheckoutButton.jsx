import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../config';
import { trackBeginPayPalCheckout } from '../utils/siteActions';

// Public Sandbox Client ID fallback so checkout buttons render & work in preview even before backend upload
const FALLBACK_SANDBOX_CLIENT_ID =
  import.meta.env.VITE_PAYPAL_CLIENT_ID ||
  'AXEexQFf91SuizjjtG0M_UhXpLq_cMMkB7drROr1oOFQEIZ4e38X27ADQpxUfHJgDdcOCWjdcWJY4Prc';

let cachedConfigPromise = null;
let loadedSdkClientId = null;

function fetchPayPalConfig() {
  if (!cachedConfigPromise) {
    cachedConfigPromise = fetch(`${API}/paypal/config`)
      .then((res) => {
        if (!res.ok) throw new Error('Backend PayPal route not deployed yet');
        return res.json();
      })
      .then((json) => {
        if (json?.success && json.data?.clientId) {
          return { ...json.data, backendReady: true };
        }
        throw new Error('Invalid PayPal config');
      })
      .catch(() => ({
        mode: 'sandbox',
        clientId: FALLBACK_SANDBOX_CLIENT_ID,
        currency: 'USD',
        backendReady: false,
      }));
  }
  return cachedConfigPromise;
}

function loadPayPalSdk(clientId, currency = 'USD') {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('SSR'));

    if (window.paypal && loadedSdkClientId === clientId) {
      return resolve(window.paypal);
    }

    const existing = document.querySelector('script[data-fosselat-paypal-sdk="true"]');
    if (existing) existing.remove();

    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=${encodeURIComponent(currency)}&intent=capture&enable-funding=card`;
    script.async = true;
    script.dataset.fosselatPaypalSdk = 'true';
    script.onload = () => {
      loadedSdkClientId = clientId;
      if (window.paypal) resolve(window.paypal);
      else reject(new Error('PayPal SDK loaded without window.paypal'));
    };
    script.onerror = () => reject(new Error('Failed to load PayPal checkout script'));
    document.body.appendChild(script);
  });
}

export default function PayPalCheckoutButton({
  planId,
  planName,
  duration,
  monthlyTotal,
  pageSource = 'Pricing',
  onSuccess,
}) {
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading | ready | processing | error
  const [errorMsg, setErrorMsg] = useState('');
  const [mode, setMode] = useState('');

  useEffect(() => {
    let cancelled = false;
    let buttonsInstance = null;

    async function init() {
      if (!planId || !duration || !monthlyTotal) return;
      setStatus('loading');
      setErrorMsg('');

      try {
        const config = await fetchPayPalConfig();
        if (cancelled) return;
        setMode(config.mode || '');

        const paypal = await loadPayPalSdk(config.clientId, config.currency || 'USD');
        if (cancelled || !containerRef.current) return;

        containerRef.current.innerHTML = '';

        buttonsInstance = paypal.Buttons({
          style: {
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'pay',
            height: 46,
            tagline: false,
          },
          createOrder: async (_data, actions) => {
            setErrorMsg('');
            trackBeginPayPalCheckout({
              planName: planName || planId,
              duration,
              monthlyTotal,
              pageSource,
            });

            if (config.backendReady) {
              try {
                const res = await fetch(`${API}/paypal/create-order`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    planId,
                    duration: Number(duration),
                    pageSource,
                  }),
                });
                const json = await res.json();
                if (res.ok && json.success && json.data?.id) {
                  return json.data.id;
                }
              } catch {
                // Fall back to direct SDK order creation below
              }
            }

            return actions.order.create({
              intent: 'CAPTURE',
              purchase_units: [
                {
                  description: `Fosselat Academy — ${planName || planId} Plan (${duration} min/class, 4-week monthly cycle)`,
                  amount: {
                    currency_code: 'USD',
                    value: String(monthlyTotal),
                  },
                },
              ],
              application_context: {
                brand_name: 'Fosselat Academy',
                shipping_preference: 'NO_SHIPPING',
                user_action: 'PAY_NOW',
              },
            });
          },
          onApprove: async (data, actions) => {
            setStatus('processing');
            try {
              let order = null;

              if (config.backendReady) {
                const res = await fetch(`${API}/paypal/capture-order`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    orderId: data.orderID,
                    planId,
                    duration: Number(duration),
                    pageSource,
                  }),
                });
                const json = await res.json();
                if (res.ok && json.success) {
                  order = json.data;
                }
              }

              if (!order && actions?.order) {
                const details = await actions.order.capture();
                order = {
                  orderId: details.id || data.orderID,
                  planName: planName || planId,
                  duration: Number(duration),
                  amount: String(monthlyTotal),
                  pageSource,
                };
              }

              if (!order) {
                throw new Error('Could not confirm payment capture');
              }

              try {
                sessionStorage.setItem('fosselat_last_order', JSON.stringify(order));
              } catch {}

              if (onSuccess) onSuccess(order);

              const params = new URLSearchParams({
                order: order.orderId || data.orderID,
                plan: order.planName || planName || planId,
                duration: String(order.duration || duration),
                amount: String(order.amount || monthlyTotal),
                source: pageSource,
              });
              navigate(`/thank-you?${params.toString()}`);
            } catch (err) {
              setStatus('ready');
              setErrorMsg(err.message || 'Payment confirmation issue. Please message us on WhatsApp with your receipt.');
            }
          },
          onCancel: () => {
            setErrorMsg('Payment was cancelled. You can try again anytime or message us on WhatsApp.');
          },
          onError: (err) => {
            console.error('[PayPal Button Error]', err);
            setErrorMsg('Could not open PayPal checkout. Please try again or reach us directly on WhatsApp.');
          },
        });

        if (buttonsInstance.isEligible()) {
          await buttonsInstance.render(containerRef.current);
          if (!cancelled) setStatus('ready');
        } else if (!cancelled) {
          setStatus('error');
          setErrorMsg('PayPal checkout is unavailable in this browser. Please message us on WhatsApp below to enroll.');
        }
      } catch {
        if (!cancelled) {
          setStatus('error');
          setErrorMsg('Could not load PayPal buttons right now (check if an ad-blocker is blocking paypal.com). You can also enroll via WhatsApp below.');
        }
      }
    }

    init();

    return () => {
      cancelled = true;
      if (buttonsInstance && typeof buttonsInstance.close === 'function') {
        try {
          buttonsInstance.close();
        } catch {}
      }
    };
  }, [planId, duration, planName, monthlyTotal, pageSource, navigate, onSuccess]);

  return (
    <div className="paypal-checkout-box">
      {status === 'loading' && (
        <div className="paypal-loading-skeleton">
          Loading secure PayPal &amp; Card buttons…
        </div>
      )}

      {status === 'processing' && (
        <div className="paypal-loading-skeleton">
          Confirming your payment… please wait.
        </div>
      )}

      <div
        ref={containerRef}
        className="paypal-buttons-mount"
        style={{ display: status === 'processing' ? 'none' : 'block' }}
      />

      {errorMsg && (
        <p className="paypal-error-note">{errorMsg}</p>
      )}

      <p className="paypal-card-hint">
        Pay with your PayPal account <strong>or Debit / Credit Card</strong> — no PayPal account required.
      </p>
    </div>
  );
}
