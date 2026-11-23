import express from 'express';
import nodemailer from 'nodemailer';
import { getDB } from '../db.js';

const router = express.Router();

// Authoritative pricing table (4-week monthly cycle in USD)
const PLANS = {
  starter: { id: 'starter', name: 'Starter', classesPerWeek: 2, discount: 0 },
  growth: { id: 'growth', name: 'Growth', classesPerWeek: 3, discount: 0.05 },
  excellence: { id: 'excellence', name: 'Excellence', classesPerWeek: 4, discount: 0.07 },
  elite: { id: 'elite', name: 'Elite', classesPerWeek: 5, discount: 0.10 },
};

const DURATIONS = {
  30: 4,
  40: 5.33,
  45: 6,
  60: 8,
  90: 12,
  120: 16,
};

function getPayPalConfig() {
  const mode = (process.env.PAYPAL_MODE || 'sandbox').toLowerCase() === 'live' ? 'live' : 'sandbox';
  const clientId = mode === 'live'
    ? process.env.PAYPAL_LIVE_CLIENT_ID
    : process.env.PAYPAL_SANDBOX_CLIENT_ID;
  const clientSecret = mode === 'live'
    ? process.env.PAYPAL_LIVE_CLIENT_SECRET
    : process.env.PAYPAL_SANDBOX_CLIENT_SECRET;
  const baseUrl = mode === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

  return { mode, clientId, clientSecret, baseUrl };
}

function calculatePlanPrice(planId, durationMinutes) {
  const plan = PLANS[String(planId || '').toLowerCase()];
  const rate = DURATIONS[Number(durationMinutes)];
  if (!plan || !rate) return null;

  const monthlyClasses = plan.classesPerWeek * 4;
  const subtotal = monthlyClasses * rate;
  const discountAmount = subtotal * plan.discount;
  const total = subtotal - discountAmount;

  return {
    planId: plan.id,
    planName: plan.name,
    classesPerWeek: plan.classesPerWeek,
    monthlyClasses,
    duration: Number(durationMinutes),
    ratePerClass: rate,
    discountPct: Math.round(plan.discount * 100),
    subtotal: Number(subtotal.toFixed(2)),
    discountAmount: Number(discountAmount.toFixed(2)),
    total: total.toFixed(2),
  };
}

async function getAccessToken() {
  const { clientId, clientSecret, baseUrl, mode } = getPayPalConfig();
  if (!clientId || !clientSecret) {
    throw new Error(`PayPal ${mode} credentials are not configured on the server`);
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();
  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description || 'Failed to authenticate with PayPal');
  }

  return { accessToken: data.access_token, baseUrl, mode };
}

async function sendPaymentEmails(orderRecord) {
  try {
    const smtpHost = process.env.SMTP_SERVER;
    const smtpPort = parseInt(process.env.SMTP_PORT, 10) || 465;
    const smtpUser = process.env.SMTP_USERNAME;
    const smtpPass = process.env.SMTP_PASSWORD;

    if (!smtpHost || !smtpUser || !smtpPass) return;

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: true,
      auth: { user: smtpUser, pass: smtpPass },
    });

    // Notify Admin
    await transporter.sendMail({
      from: `"Fosselat Academy Payments" <${smtpUser}>`,
      to: smtpUser,
      subject: `[${orderRecord.mode.toUpperCase()}] New PayPal Enrollment — ${orderRecord.planName} ($${orderRecord.amount})`,
      text: [
        `A new monthly plan payment has been completed via PayPal (${orderRecord.mode}).`,
        ``,
        `Order ID: ${orderRecord.orderId}`,
        `Capture ID: ${orderRecord.captureId || 'N/A'}`,
        `Amount Paid: $${orderRecord.amount} ${orderRecord.currency}`,
        `Plan: ${orderRecord.planName} (${orderRecord.classesPerWeek} classes/week, ${orderRecord.duration} min)`,
        `Monthly Classes: ${orderRecord.monthlyClasses}`,
        `Payer Name: ${orderRecord.payerName || 'N/A'}`,
        `Payer Email: ${orderRecord.payerEmail || 'N/A'}`,
        `Student Name: ${orderRecord.studentName || 'N/A'}`,
        `Student WhatsApp: ${orderRecord.studentWhatsapp || 'N/A'}`,
        `Page Source: ${orderRecord.pageSource || 'Website'}`,
        `Date: ${new Date().toISOString()}`,
      ].join('\n'),
    });

    // Confirmation email to student/payer if email available
    if (orderRecord.payerEmail) {
      await transporter.sendMail({
        from: `"Fosselat Academy" <${smtpUser}>`,
        to: orderRecord.payerEmail,
        subject: `Welcome to Fosselat Academy — Payment Confirmation (#${orderRecord.orderId})`,
        text: [
          `Assalamu Alaikum ${orderRecord.payerName || 'Student'},`,
          ``,
          `Thank you for enrolling at Fosselat Academy! Your payment has been received successfully.`,
          ``,
          `Order Reference: ${orderRecord.orderId}`,
          `Plan: ${orderRecord.planName} — ${orderRecord.classesPerWeek} classes/week (${orderRecord.duration} min per class)`,
          `Amount Paid: $${orderRecord.amount} ${orderRecord.currency}`,
          ``,
          `Next Step:`,
          `Message us right away on WhatsApp with your Order Reference (#${orderRecord.orderId}) to pick your preferred class schedule and teacher: https://wa.me/966595796177`,
          `Our academic coordinator is ready to get your first class scheduled as soon as you reach out.`,
          ``,
          `Remember: Your enrollment is protected by our 30-Day Money-Back Guarantee.`,
          ``,
          `Jazakum Allahu Khairan,`,
          `Fosselat Academy Team`,
        ].join('\n'),
      });
    }
  } catch (err) {
    console.error('[PayPal] Email notification error:', err);
  }
}

// GET /api/paypal/config — Public client ID & active mode (Sandbox or Live)
router.get('/config', (req, res) => {
  const { mode, clientId } = getPayPalConfig();
  if (!clientId) {
    return res.status(503).json({
      success: false,
      message: 'PayPal is not configured yet',
    });
  }
  return res.json({
    success: true,
    data: {
      mode,
      clientId,
      currency: 'USD',
    },
  });
});

// POST /api/paypal/create-order — Creates a verified PayPal Orders v2 order
router.post('/create-order', async (req, res) => {
  try {
    const { planId, duration, studentName, studentWhatsapp, pageSource } = req.body || {};
    const calc = calculatePlanPrice(planId, duration);

    if (!calc) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan or class duration selected',
      });
    }

    const { accessToken, baseUrl, mode } = await getAccessToken();

    const description = `Fosselat Academy — ${calc.planName} Plan (${calc.classesPerWeek}x/week, ${calc.duration} min/class, 4-week monthly cycle)`;

    const orderPayload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: `${calc.planId}_${calc.duration}m`,
          description: description.slice(0, 127),
          custom_id: JSON.stringify({
            planId: calc.planId,
            duration: calc.duration,
            pageSource: (pageSource || 'website').slice(0, 30),
          }).slice(0, 127),
          amount: {
            currency_code: 'USD',
            value: calc.total,
          },
        },
      ],
      application_context: {
        brand_name: 'Fosselat Academy',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        shipping_preference: 'NO_SHIPPING',
      },
    };

    const ppRes = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderPayload),
    });

    const ppData = await ppRes.json();
    if (!ppRes.ok || !ppData.id) {
      console.error('[PayPal] create-order failed:', ppData);
      return res.status(502).json({
        success: false,
        message: ppData.message || 'Could not create PayPal order',
      });
    }

    // Store pending intent in DB for audit trail
    try {
      const db = getDB();
      await db.collection('paypal_orders').insertOne({
        orderId: ppData.id,
        status: 'CREATED',
        mode,
        currency: 'USD',
        amount: calc.total,
        ...calc,
        studentName: (studentName || '').trim(),
        studentWhatsapp: (studentWhatsapp || '').trim(),
        pageSource: (pageSource || 'website').trim(),
        createdAt: new Date(),
      });
    } catch (dbErr) {
      console.error('[PayPal] Failed to log created order:', dbErr);
    }

    return res.json({
      success: true,
      data: {
        id: ppData.id,
        amount: calc.total,
        currency: 'USD',
        plan: calc,
      },
    });
  } catch (err) {
    console.error('[PayPal] create-order error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error creating PayPal order',
    });
  }
});

// POST /api/paypal/capture-order — Captures approved PayPal order & records it
router.post('/capture-order', async (req, res) => {
  try {
    const { orderId, planId, duration, studentName, studentWhatsapp, pageSource } = req.body || {};
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Missing orderId' });
    }

    const { accessToken, baseUrl, mode } = await getAccessToken();

    const ppRes = await fetch(`${baseUrl}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const ppData = await ppRes.json();
    if (!ppRes.ok) {
      console.error('[PayPal] capture-order failed:', ppData);
      return res.status(502).json({
        success: false,
        message: ppData.message || 'Could not capture PayPal payment',
      });
    }

    const purchaseUnit = ppData.purchase_units?.[0];
    const capture = purchaseUnit?.payments?.captures?.[0];
    const payerName = [ppData.payer?.name?.given_name, ppData.payer?.name?.surname].filter(Boolean).join(' ');
    const payerEmail = ppData.payer?.email_address || '';
    const capturedAmount = capture?.amount?.value || purchaseUnit?.amount?.value || '0.00';
    const capturedCurrency = capture?.amount?.currency_code || 'USD';

    const calc = calculatePlanPrice(planId, duration);

    const orderRecord = {
      orderId: ppData.id,
      captureId: capture?.id || '',
      status: ppData.status || 'COMPLETED',
      mode,
      amount: capturedAmount,
      currency: capturedCurrency,
      planId: calc?.planId || planId || '',
      planName: calc?.planName || planId || 'Monthly Plan',
      classesPerWeek: calc?.classesPerWeek || 0,
      monthlyClasses: calc?.monthlyClasses || 0,
      duration: calc?.duration || Number(duration) || 0,
      payerName,
      payerEmail,
      studentName: (studentName || payerName || '').trim(),
      studentWhatsapp: (studentWhatsapp || '').trim(),
      pageSource: (pageSource || 'website').trim(),
      capturedAt: new Date(),
    };

    try {
      const db = getDB();
      await db.collection('paypal_orders').updateOne(
        { orderId: ppData.id },
        {
          $set: orderRecord,
          $setOnInsert: { createdAt: new Date() },
        },
        { upsert: true }
      );
    } catch (dbErr) {
      console.error('[PayPal] Failed to update captured order in DB:', dbErr);
    }

    // Send emails asynchronously without blocking response
    sendPaymentEmails(orderRecord);

    return res.json({
      success: true,
      data: orderRecord,
    });
  } catch (err) {
    console.error('[PayPal] capture-order error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error capturing PayPal order',
    });
  }
});

export default router;
