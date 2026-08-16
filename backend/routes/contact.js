import express from 'express';
import { getDB } from '../db.js';
import nodemailer from 'nodemailer';

const router = express.Router();

// POST /api/contact
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body || {};
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Missing required fields: name, email, message' });
    }

    const db = getDB();
    await db.collection('contacts').insertOne({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      message: message.trim(),
      submitted_at: new Date(),
    });

    // Send email using Nodemailer
    if (process.env.SMTP_SERVER && process.env.SMTP_USERNAME && process.env.SMTP_PASSWORD) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_SERVER,
          port: parseInt(process.env.SMTP_PORT) || 465,
          secure: true, // true for 465, false for other ports
          auth: {
            user: process.env.SMTP_USERNAME,
            pass: process.env.SMTP_PASSWORD,
          },
        });

        await transporter.sendMail({
          from: `"Fosselat Academy Contact" <${process.env.SMTP_USERNAME}>`,
          to: process.env.SMTP_USERNAME, // Send to the info address
          replyTo: email,
          subject: `New Contact Form Message from ${name}`,
          text: `You have received a new message from the Fosselat Academy Contact Form.\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        });
      } catch (emailErr) {
        console.error('Failed to send email:', emailErr);
        // We don't fail the request if the email fails, as it's still saved in DB
      }
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
