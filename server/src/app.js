import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.routes.js';
import studentRoutes from './routes/student.routes.js';
import adminRoutes from './routes/admin.routes.js';
import { ensureUploadDirs } from './utils/file.js';
import { startReminderCron } from './cron/reminders.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
ensureUploadDirs();

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);

app.use((err, req, res, next) => {
  if (err.message === 'Only PDF files are allowed' || err.message === 'Only PDF allowed') {
    return res.status(400).json({ error: 'Only PDF files are allowed' });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

startReminderCron();

export default app;
