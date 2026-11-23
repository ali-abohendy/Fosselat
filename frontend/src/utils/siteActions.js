// Centralized GTM / Google Ads / GA4 conversion tracking & context-aware WhatsApp builder

export const WHATSAPP_NUMBER = '966595796177';
export const WHATSAPP_DISPLAY = '+966 59 579 6177';

export function trackEvent(eventName, params = {}) {
  try {
    if (typeof window === 'undefined') return;
    window.dataLayer = window.dataLayer || [];
    const payload = {
      event: eventName,
      page_path: window.location?.pathname || '/',
      page_title: typeof document !== 'undefined' ? document.title : '',
      ...params,
    };
    window.dataLayer.push(payload);
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
    }
  } catch {
    // Non-blocking analytics
  }
}

export function trackPageView(pathname, title) {
  trackEvent('page_view', {
    page_path: pathname,
    page_title: title || (typeof document !== 'undefined' ? document.title : ''),
  });
}

export function trackWhatsAppClick(source, extra = {}) {
  trackEvent('whatsapp_click', {
    click_source: source,
    ...extra,
  });
}

export function trackBeginPayPalCheckout({ planName, duration, monthlyTotal, pageSource }) {
  trackEvent('begin_checkout', {
    payment_method: 'paypal',
    currency: 'USD',
    value: Number(monthlyTotal) || 0,
    plan_name: planName,
    class_duration: duration,
    page_source: pageSource || 'website',
  });
  trackEvent('paypal_checkout_start', {
    currency: 'USD',
    value: Number(monthlyTotal) || 0,
    plan_name: planName,
    class_duration: duration,
    page_source: pageSource || 'website',
  });
}

export function trackPurchase({ orderId, amount, planName, duration, pageSource }) {
  trackEvent('purchase', {
    transaction_id: orderId || '',
    currency: 'USD',
    value: Number(amount) || 0,
    payment_method: 'paypal',
    plan_name: planName || '',
    class_duration: duration || 0,
    page_source: pageSource || 'website',
    items: [
      {
        item_name: `${planName || 'Monthly Plan'} (${duration || 30} min)`,
        price: Number(amount) || 0,
        quantity: 1,
      },
    ],
  });
}

export function trackCurriculumLead({ contactType, pageSource }) {
  trackEvent('generate_lead', {
    lead_type: 'curriculum_pdf_42p',
    contact_type: contactType || 'email',
    page_source: pageSource || 'curriculum',
  });
}

export function buildWhatsAppUrl({
  page = 'Website',
  intent = 'trial',
  planName = '',
  classesPerWeek = '',
  duration = '',
  monthlyTotal = '',
  orderId = '',
  customText = '',
} = {}) {
  let message = customText;

  if (!message) {
    if (intent === 'enroll' && planName && duration) {
      const pricePart = monthlyTotal ? ` — $${monthlyTotal}/month` : '';
      const freqPart = classesPerWeek ? ` (${classesPerWeek} classes/week)` : '';
      message = `Assalamu Alaikum. I would like to enroll in Fosselat Academy.\nPlan: ${planName}${freqPart}\nDuration: ${duration} min/class${pricePart}`;
    } else if (intent === 'question_plan' && planName && duration) {
      const pricePart = monthlyTotal ? ` ($${monthlyTotal}/month)` : '';
      message = `Assalamu Alaikum. I have a question before subscribing to the ${planName} plan (${duration} min/class${pricePart}).`;
    } else if (intent === 'post_payment' && orderId) {
      message = `Assalamu Alaikum. I just completed my PayPal enrollment on Fosselat Academy!\nOrder Ref: ${orderId}\nPlan: ${planName} (${duration} min/class — $${monthlyTotal}/mo)\nI would like to schedule my first class.`;
    } else if (intent === 'general') {
      message = `Assalamu Alaikum. I would like to know more about Fosselat Academy classes.`;
    } else {
      message = `Assalamu Alaikum. I would like to book a Free Trial class at Fosselat Academy.`;
    }
  }

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
