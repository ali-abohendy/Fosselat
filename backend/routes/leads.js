import express from 'express';
import nodemailer from 'nodemailer';
import { getDB } from '../db.js';

const router = express.Router();

// POST /api/leads/curriculum — Capture Email or WhatsApp lead before unlocking 42-page PDF
router.post('/curriculum', async (req, res) => {
  try {
    const { name, contact, contactType, pageSource } = req.body || {};
    const cleanContact = String(contact || '').trim();

    if (!cleanContact || cleanContact.length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address or WhatsApp number.',
      });
    }

    const detectedType = contactType || (cleanContact.includes('@') ? 'email' : 'whatsapp');

    const leadDoc = {
      name: String(name || '').trim(),
      contact: cleanContact,
      contact_type: detectedType,
      lead_magnet: 'curriculum_pdf_42p',
      page_source: String(pageSource || 'curriculum').trim(),
      created_at: new Date(),
    };

    const db = getDB();
    await db.collection('curriculum_leads').insertOne(leadDoc);

    // Notify academy via email (non-blocking)
    try {
      const smtpHost = process.env.SMTP_SERVER;
      const smtpPort = parseInt(process.env.SMTP_PORT, 10) || 465;
      const smtpUser = process.env.SMTP_USERNAME;
      const smtpPass = process.env.SMTP_PASSWORD;

      if (smtpHost && smtpUser && smtpPass) {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: true,
          auth: { user: smtpUser, pass: smtpPass },
        });

        await transporter.sendMail({
          from: `"Fosselat Academy Leads" <${smtpUser}>`,
          to: smtpUser,
          subject: `New Curriculum PDF Download Lead (${detectedType.toUpperCase()})`,
          text: [
            `A visitor requested the 42-Page Fosselat Academy Curriculum PDF.`,
            ``,
            `Name: ${leadDoc.name || 'Not provided'}`,
            `Contact (${detectedType}): ${leadDoc.contact}`,
            `Page Source: ${leadDoc.page_source}`,
            `Time: ${new Date().toISOString()}`,
          ].join('\n'),
        });
      }
    } catch (emailErr) {
      console.error('[Leads] Failed to email curriculum lead:', emailErr);
    }

    return res.status(201).json({
      success: true,
      message: 'Your curriculum PDF is ready to download!',
      data: {
        downloadUrl: '/Fosselat_Academy_Curriculum_Framework.pdf',
      },
    });
  } catch (err) {
    console.error('[Leads] curriculum lead error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
