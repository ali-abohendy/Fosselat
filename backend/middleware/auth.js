import jwt from 'jsonwebtoken';
import { getDB, ObjectId } from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET_KEY || 'fossclat_super_secret_key_2026';

export async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authorization token is missing' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.identity || decoded.userId || decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

export async function adminMiddleware(req, res, next) {
  try {
    const db = getDB();
    const user = await db.collection('users').findOne({ _id: new ObjectId(req.userId) });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin only' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Admin access denied' });
  }
}

export async function teacherMiddleware(req, res, next) {
  try {
    const db = getDB();
    const user = await db.collection('users').findOne({ _id: new ObjectId(req.userId) });
    if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
      return res.status(403).json({ success: false, message: 'Teacher only' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Teacher access denied' });
  }
}
