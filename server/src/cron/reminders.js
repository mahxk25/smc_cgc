import cron from 'node-cron';
import pool from '../db/pool.js';
import { createNotification } from '../utils/notifications.js';

async function runReminders() {
  const [rows24] = await pool.query(
    `SELECT e.id AS eventId, e.title, e.startTime, er.studentId FROM events e
     INNER JOIN event_registrations er ON er.eventId = e.id
     WHERE e.startTime BETWEEN DATE_ADD(NOW(), INTERVAL 23 HOUR) AND DATE_ADD(NOW(), INTERVAL 25 HOUR)`
  );
  const [rows1] = await pool.query(
    `SELECT e.id AS eventId, e.title, e.startTime, er.studentId FROM events e
     INNER JOIN event_registrations er ON er.eventId = e.id
     WHERE e.startTime BETWEEN DATE_ADD(NOW(), INTERVAL 50 MINUTE) AND DATE_ADD(NOW(), INTERVAL 70 MINUTE)`
  );
  for (const r of rows24) {
    await createNotification({
      userType: 'STUDENT',
      userId: r.studentId,
      title: 'Event reminder (24h)',
      message: `"${r.title}" starts at ${new Date(r.startTime).toLocaleString()}.`,
      link: '/student/events',
    });
  }
  for (const r of rows1) {
    await createNotification({
      userType: 'STUDENT',
      userId: r.studentId,
      title: 'Event reminder (1h)',
      message: `"${r.title}" starts in about 1 hour.`,
      link: '/student/events',
    });
  }
}

export function startReminderCron() {
  cron.schedule('*/10 * * * *', () => {
    runReminders().catch((e) => console.error('Reminder cron error:', e));
  });
}
