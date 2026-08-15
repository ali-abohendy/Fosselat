import express from 'express';
import { getDB } from '../db.js';

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

    return res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully',
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
