import 'dotenv/config';
import bcrypt from 'bcrypt';
import pool from './pool.js';

async function run() {
  const dobHash = await bcrypt.hash('25/02/2005', 10);
  const adminHash = await bcrypt.hash('admin123', 10);

  try {
    await pool.query(
      `INSERT INTO admins (username, password_hash, role) VALUES (?, ?, 'ADMIN')
       ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
      ['admin', adminHash]
    );
    await pool.query(
      `INSERT INTO admins (username, password_hash, role) VALUES (?, ?, 'PLACEMENT_OFFICER')
       ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
      ['placement', adminHash]
    );
    await pool.query(
      `INSERT INTO students (deptNo, name, dob_hash, department, cgpa, email, phone)
       VALUES ('23/UCSA/101', 'Demo Student', ?, 'CSE', 8.50, 'demo.student@smc.edu', '9876543210')
       ON DUPLICATE KEY UPDATE dob_hash = VALUES(dob_hash)`,
      [dobHash]
    );
    console.log('Seed runner: admin (admin/admin123) and student (23/UCSA/101 / 25/02/2005) ready.');
  } catch (e) {
    console.error('Seed runner error:', e.message);
  } finally {
    await pool.end();
  }
}

run();
