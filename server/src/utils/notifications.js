import pool from '../db/pool.js';

export async function createNotification({ userType, userId, title, message, link }) {
  const [r] = await pool.query(
    `INSERT INTO notifications (userType, userId, title, message, link) VALUES (?, ?, ?, ?, ?)`,
    [userType, userId, title ?? '', message ?? null, link ?? null]
  );
  return r.insertId;
}

export async function notifyStudents(studentIds, title, message, link) {
  if (!studentIds?.length) return;
  const values = studentIds.map((id) => ['STUDENT', id, title, message, link]);
  await pool.query(
    `INSERT INTO notifications (userType, userId, title, message, link) VALUES ?`,
    [values.map((v) => [v[0], v[1], v[2], v[3], v[4]])]
  );
}

export async function notifyStudent(studentId, title, message, link) {
  return createNotification({ userType: 'STUDENT', userId: studentId, title, message, link });
}

export async function getReminderCandidates(withinMinutes) {
  const [rows] = await pool.query(
    `SELECT e.id AS eventId, e.title, e.startTime, er.studentId
     FROM events e
     INNER JOIN event_registrations er ON er.eventId = e.id
     WHERE e.startTime BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL ? MINUTE)`,
    [withinMinutes]
  );
  return rows;
}
