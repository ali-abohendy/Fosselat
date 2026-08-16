import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './db.js';

import authRoutes from './routes/auth.js';
import coursesRoutes from './routes/courses.js';
import teachersRoutes from './routes/teachers.js';
import enrollmentsRoutes from './routes/enrollments.js';
import contactRoutes from './routes/contact.js';
import adminRoutes from './routes/admin.js';
import teacherRoutes from './routes/teacher.js';
import { studentRouter, meetingsRouter, reviewsRouter, sessionsRouter } from './routes/student.js';
import placementRoutes from './routes/placement.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all origins
app.use(cors({ origin: '*' }));
app.use(express.json());

// Start HTTP server immediately so Hostinger/Nginx proxy doesn't timeout
app.listen(PORT, () => {
  console.log(`[Express] Server running on port ${PORT}`);
});

// Connect to MongoDB asynchronously in the background
connectDB().then(() => {
  console.log('[Express] Database ready');
}).catch((err) => {
  console.error('[Express] Background database connection error:', err);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/teachers', teachersRoutes);
app.use('/api/enrollments', enrollmentsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/student', studentRouter);
app.use('/api/meetings', meetingsRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/placement', placementRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  return res.json({ success: true, message: 'Fosselat Academy Express API is running' });
});

app.get('/', (req, res) => {
  return res.json({ success: true, message: 'Fosselat Academy Backend Server' });
});

export default app;
