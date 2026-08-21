import express from 'express';
import { getDB } from '../db.js';
import nodemailer from 'nodemailer';

const router = express.Router();

// POST /api/contact
router.post('/', async (req, res) => {
  try {
    const { name, email, message, isSupport } = req.body || {};
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Missing required fields: name, email, message' });
    }

    const db = getDB();
    await db.collection('contacts').insertOne({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      message: message.trim(),
      is_support: !!isSupport,
      submitted_at: new Date(),
    });

    // Send email using Nodemailer
    try {
      const smtpHost = isSupport ? 'smtp.hostinger.com' : process.env.SMTP_SERVER;
      const smtpPort = isSupport ? 465 : parseInt(process.env.SMTP_PORT) || 465;
      const smtpUser = isSupport ? 'support@fosselatacademy.com' : process.env.SMTP_USERNAME;
      const smtpPass = isSupport ? 'Fosselat@20012001' : process.env.SMTP_PASSWORD;
      const targetEmail = isSupport ? 'support@fosselatacademy.com' : process.env.SMTP_USERNAME;
      const emailSubject = isSupport 
        ? `New Support Request from ${name}` 
        : `New Contact Form Message from ${name}`;

      if (smtpHost && smtpUser && smtpPass) {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: true,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        await transporter.sendMail({
          from: `"Fosselat Academy" <${smtpUser}>`,
          to: targetEmail,
          replyTo: email,
          subject: emailSubject,
          text: `You have received a new message.\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        });
      }
    } catch (emailErr) {
      console.error('Failed to send email:', emailErr);
    }

    return res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully',
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
