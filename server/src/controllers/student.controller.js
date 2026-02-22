import * as studentService from '../services/student.service.js';
import * as applicationService from '../services/application.service.js';
import * as notificationService from '../utils/notifications.js';
import pool from '../db/pool.js';

function getChatRoomIdByCompanyId(companyId) {
  return pool.query('SELECT id FROM chat_rooms WHERE companyId = ?', [companyId]).then(([r]) => r[0]?.id ?? null);
}
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { OFFERS_DIR, RESUMES_DIR } from '../utils/file.js';

const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, RESUMES_DIR),
  filename: (req, file, cb) => cb(null, `resume_${req.studentId}_${Date.now()}${path.extname(file.originalname) || '.pdf'}`),
});
const resumeUpload = multer({
  storage: resumeStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = (path.extname(file.originalname) || '').toLowerCase();
    const ok = ['.pdf', '.doc', '.docx'].includes(ext) || (file.mimetype && ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.mimetype));
    cb(null, !!ok);
  },
});
export const uploadResumeMulter = resumeUpload.single('resume');

export async function me(req, res) {
  const user = await studentService.getStudentById(req.studentId);
  if (!user) return res.status(404).json({ error: 'Student not found' });
  const canApply = await applicationService.canStudentApply(req.studentId);
  res.json({ ...user, canApply: canApply.allowed, canApplyReason: canApply.reason });
}

export async function updateProfile(req, res) {
  const { name, department, cgpa, email, phone } = req.body;
  const updates = {};
  if (name !== undefined) updates.name = String(name).trim();
  if (department !== undefined) updates.department = String(department).trim();
  if (cgpa !== undefined) updates.cgpa = cgpa === '' || cgpa === null ? null : parseFloat(cgpa);
  if (email !== undefined) updates.email = String(email).trim();
  if (phone !== undefined) updates.phone = String(phone).trim() || null;
  if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'No valid fields to update' });
  const ok = await studentService.updateStudentProfile(req.studentId, updates);
  if (!ok) return res.status(400).json({ error: 'Update failed' });
  const user = await studentService.getStudentById(req.studentId);
  const canApply = await applicationService.canStudentApply(req.studentId);
  res.json({ ...user, canApply: canApply.allowed, canApplyReason: canApply.reason });
}

export async function uploadResume(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'Resume file required. Use PDF or DOC/DOCX (max 5MB).' });
  }
  const relativePath = path.basename(req.file.path);
  const user = await studentService.getStudentById(req.studentId);
  if (user?.resume_path) {
    const oldPath = path.join(RESUMES_DIR, path.basename(user.resume_path));
    if (fs.existsSync(oldPath)) try { fs.unlinkSync(oldPath); } catch (_) {}
  }
  try {
    await studentService.setStudentResume(req.studentId, relativePath);
  } catch (err) {
    if (fs.existsSync(req.file.path)) try { fs.unlinkSync(req.file.path); } catch (_) {}
    if (err.code === 'ER_BAD_FIELD_ERROR' || (err.message && err.message.includes('resume_path'))) {
      return res.status(503).json({ error: 'Resume feature is not enabled. Ask admin to run database migration 002_student_resume.sql.' });
    }
    throw err;
  }
  const updated = await studentService.getStudentById(req.studentId);
  const canApply = await applicationService.canStudentApply(req.studentId);
  res.status(201).json({ ...updated, canApply: canApply.allowed, canApplyReason: canApply.reason });
}

export async function downloadResume(req, res) {
  const user = await studentService.getStudentById(req.studentId);
  if (!user?.resume_path) return res.status(404).json({ error: 'No resume uploaded' });
  const filePath = path.join(RESUMES_DIR, path.basename(user.resume_path));
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });
  res.sendFile(path.resolve(filePath), { headers: { 'Content-Disposition': `attachment; filename="${path.basename(filePath)}"` } });
}

export async function deleteResume(req, res) {
  const user = await studentService.getStudentById(req.studentId);
  if (!user?.resume_path) return res.status(404).json({ error: 'No resume uploaded' });
  const filePath = path.join(RESUMES_DIR, path.basename(user.resume_path));
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  await studentService.clearStudentResume(req.studentId);
  const updated = await studentService.getStudentById(req.studentId);
  const canApply = await applicationService.canStudentApply(req.studentId);
  res.json({ ...updated, canApply: canApply.allowed, canApplyReason: canApply.reason });
}

export async function getDrives(req, res) {
  const drives = await studentService.getDrivesForStudent(req.studentId);
  const canApply = await applicationService.canStudentApply(req.studentId);
  res.json({ drives, canApply: canApply.allowed, canApplyReason: canApply.reason });
}

export async function apply(req, res) {
  const { driveId } = req.params;
  const id = parseInt(driveId, 10);
  if (!id) return res.status(400).json({ error: 'Invalid drive ID' });

  const can = await applicationService.canStudentApply(req.studentId);
  if (!can.allowed) {
    return res.status(403).json({ error: can.reason });
  }

  const existing = await applicationService.getApplicationByStudentAndDrive(req.studentId, id);
  if (existing) {
    return res.status(400).json({ error: 'Already applied to this drive' });
  }

  const [drives] = await pool.query('SELECT id, companyId FROM drives WHERE id = ? AND status IN (?, ?)', [id, 'UPCOMING', 'ONGOING']);
  if (!drives.length) return res.status(404).json({ error: 'Drive not found or not open for applications' });

  const appId = await applicationService.createApplication(req.studentId, id);
  await notificationService.notifyStudent(req.studentId, 'Application submitted', `Your application for the drive has been submitted.`, `/student/applications`);

  const chatRoomId = await getChatRoomIdByCompanyId(drives[0].companyId);
  res.status(201).json({ applicationId: appId, message: 'Application submitted successfully', chatRoomId });
}

export async function getApplications(req, res) {
  const list = await studentService.getApplications(req.studentId);
  res.json({ applications: list });
}

export async function getOffers(req, res) {
  const list = await studentService.getOffers(req.studentId);
  res.json({ offers: list });
}

export async function offerDecision(req, res) {
  const { offerId } = req.params;
  const { decision } = req.body;
  const id = parseInt(offerId, 10);
  if (!id || !decision) return res.status(400).json({ error: 'Offer ID and decision (ACCEPT/REJECT) required' });
  const d = decision.toUpperCase();
  if (d !== 'ACCEPT' && d !== 'REJECT') return res.status(400).json({ error: 'Decision must be ACCEPT or REJECT' });

  const offer = await studentService.getOfferByIdAndStudent(id, req.studentId);
  if (!offer) return res.status(404).json({ error: 'Offer not found' });
  if (offer.decision !== 'PENDING') return res.status(400).json({ error: 'Offer already decided' });
  const deadline = new Date(offer.offerDeadline);
  if (deadline < new Date()) return res.status(400).json({ error: 'Offer deadline has passed' });

  const updated = await studentService.updateOfferDecision(id, d === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED');
  if (!updated) return res.status(400).json({ error: 'Could not update decision' });
  res.json({ message: 'Decision recorded' });
}

export async function downloadOfferPdf(req, res) {
  const { offerId } = req.params;
  const offer = await studentService.getOfferByIdAndStudent(parseInt(offerId, 10), req.studentId);
  if (!offer) return res.status(404).json({ error: 'Offer not found' });
  const filePath = path.join(OFFERS_DIR, path.basename(offer.offerPdfPath));
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });
  res.sendFile(filePath, { headers: { 'Content-Disposition': `attachment; filename="${path.basename(filePath)}"` } });
}

export async function getEvents(req, res) {
  const events = await studentService.getEvents(req.studentId);
  res.json({ events });
}

export async function registerEvent(req, res) {
  const eventId = parseInt(req.params.eventId, 10);
  if (!eventId) return res.status(400).json({ error: 'Invalid event ID' });
  const [events] = await pool.query('SELECT id FROM events WHERE id = ?', [eventId]);
  if (!events.length) return res.status(404).json({ error: 'Event not found' });
  await studentService.registerEvent(eventId, req.studentId);
  res.json({ message: 'Registered for event' });
}

export async function unregisterEvent(req, res) {
  const eventId = parseInt(req.params.eventId, 10);
  const removed = await studentService.unregisterEvent(eventId, req.studentId);
  if (!removed) return res.status(404).json({ error: 'Registration not found' });
  res.json({ message: 'Unregistered from event' });
}

export async function getNotifications(req, res) {
  const list = await studentService.getNotifications(req.studentId);
  res.json({ notifications: list });
}

export async function getUnreadNotificationCount(req, res) {
  const count = await studentService.getUnreadNotificationCount(req.studentId);
  res.json({ unreadCount: count });
}

export async function markNotificationRead(req, res) {
  const id = parseInt(req.params.id, 10);
  const ok = await studentService.markNotificationRead(id, req.studentId);
  if (!ok) return res.status(404).json({ error: 'Notification not found' });
  res.json({ message: 'Marked as read' });
}
