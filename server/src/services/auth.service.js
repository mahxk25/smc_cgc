import bcrypt from 'bcrypt';
import pool from '../db/pool.js';
import { signToken } from '../middleware/auth.js';

export async function studentLogin(deptNo, dobPlain) {
  const [rows] = await pool.query('SELECT id, name, deptNo, dob_hash, department, cgpa, email, phone FROM students WHERE deptNo = ?', [deptNo]);
  const student = rows[0];
  if (!student) return { error: 'Invalid credentials' };
  const match = await bcrypt.compare(dobPlain, student.dob_hash);
  if (!match) return { error: 'Invalid credentials' };
  const token = signToken({ id: student.id, type: 'student' });
  const { dob_hash, ...me } = student;
  return { token, user: me };
}

export async function adminLogin(username, password) {
  const [rows] = await pool.query('SELECT id, username, password_hash, role FROM admins WHERE username = ?', [username]);
  const admin = rows[0];
  if (!admin) return { error: 'Invalid credentials' };
  const match = await bcrypt.compare(password, admin.password_hash);
  if (!match) return { error: 'Invalid credentials' };
  const token = signToken({ id: admin.id, type: 'admin', role: admin.role });
  return { token, user: { id: admin.id, username: admin.username, role: admin.role } };
}
