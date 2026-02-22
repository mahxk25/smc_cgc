import pool from '../db/pool.js';
import bcrypt from 'bcrypt';
import * as adminService from '../services/admin.service.js';
import * as applicationService from '../services/application.service.js';
import * as notificationService from '../utils/notifications.js';
import { buildStudentsWorkbook, buildEventRegistrationsWorkbook, writeWorkbookToBuffer } from '../utils/excel.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { OFFERS_DIR, ensureUploadDirs } from '../utils/file.js';

ensureUploadDirs();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, OFFERS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.pdf';
    if (ext.toLowerCase() !== '.pdf') return cb(new Error('Only PDF allowed'), null);
    cb(null, `offer_${Date.now()}_${Math.random().toString(36).slice(2)}.pdf`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = (path.extname(file.originalname) || '').toLowerCase();
    if (ext !== '.pdf') return cb(new Error('Only PDF files are allowed'));
    cb(null, true);
  },
});

export async function getMe(req, res) {
  const admin = await adminService.getAdminById(req.adminId);
  if (!admin) return res.status(404).json({ error: 'Admin not found' });
  res.json({ id: admin.id, username: admin.username });
}

export async function getDashboard(req, res) {
  const data = await adminService.getDashboard();
  res.json(data);
}

// Students CRUD
export async function listStudents(req, res) {
  const { department, search, limit, offset } = req.query;
  const filters = { department, search, limit: limit ? parseInt(limit, 10) : undefined, offset: offset ? parseInt(offset, 10) : undefined };
  const [list, totalCount] = await Promise.all([
    adminService.listStudents(filters),
    adminService.countStudents(filters),
  ]);
  res.json({ students: list, totalCount });
}

export async function getStudent(req, res) {
  const id = parseInt(req.params.id, 10);
  const student = await adminService.getStudentById(id);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  res.json(student);
}

export async function createStudent(req, res) {
  const { deptNo, name, password, department, cgpa, email, phone } = req.body;
  if (!deptNo || !name || !password || !department || !email) {
    return res.status(400).json({ error: 'deptNo, name, password, department, email required' });
  }
  const dob_hash = await bcrypt.hash(password, 10);
  const id = await adminService.createStudent({ deptNo, name, dob_hash, department, cgpa: cgpa ? parseFloat(cgpa) : null, email, phone });
  await adminService.createAuditLog('ADMIN', req.adminId, 'STUDENT_CREATE', { studentId: id, deptNo });
  res.status(201).json({ id, message: 'Student created' });
}

export async function updateStudent(req, res) {
  const id = parseInt(req.params.id, 10);
  const ok = await adminService.updateStudent(id, req.body);
  if (!ok) return res.status(400).json({ error: 'No valid fields to update' });
  await adminService.createAuditLog('ADMIN', req.adminId, 'STUDENT_UPDATE', { studentId: id });
  res.json({ message: 'Updated' });
}

export async function deleteStudent(req, res) {
  const id = parseInt(req.params.id, 10);
  const ok = await adminService.deleteStudent(id);
  if (!ok) return res.status(404).json({ error: 'Student not found' });
  await adminService.createAuditLog('ADMIN', req.adminId, 'STUDENT_DELETE', { studentId: id });
  res.json({ message: 'Deleted' });
}

// Companies CRUD
export async function listCompanies(req, res) {
  const { search, limit, offset } = req.query;
  const filters = { search, limit: limit ? parseInt(limit, 10) : undefined, offset: offset ? parseInt(offset, 10) : undefined };
  const [list, totalCount] = await Promise.all([
    adminService.listCompanies(filters),
    adminService.countCompanies(filters),
  ]);
  res.json({ companies: list, totalCount });
}

export async function getCompany(req, res) {
  const id = parseInt(req.params.id, 10);
  const company = await adminService.getCompanyById(id);
  if (!company) return res.status(404).json({ error: 'Company not found' });
  res.json(company);
}

export async function createCompany(req, res) {
  const { name, industry, contactPerson, contactEmail, contactPhone, jobDescription, salaryPackage } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const id = await adminService.createCompany({ name, industry, contactPerson, contactEmail, contactPhone, jobDescription, salaryPackage });
  await adminService.createAuditLog('ADMIN', req.adminId, 'COMPANY_CREATE', { companyId: id, name });
  res.status(201).json({ id, message: 'Company created' });
}

export async function updateCompany(req, res) {
  const id = parseInt(req.params.id, 10);
  const ok = await adminService.updateCompany(id, req.body);
  if (!ok) return res.status(400).json({ error: 'No valid fields to update' });
  await adminService.createAuditLog('ADMIN', req.adminId, 'COMPANY_UPDATE', { companyId: id });
  res.json({ message: 'Updated' });
}

export async function deleteCompany(req, res) {
  const id = parseInt(req.params.id, 10);
  const ok = await adminService.deleteCompany(id);
  if (!ok) return res.status(404).json({ error: 'Company not found' });
  await adminService.createAuditLog('ADMIN', req.adminId, 'COMPANY_DELETE', { companyId: id });
  res.json({ message: 'Deleted' });
}

// Drives CRUD
export async function listDrives(req, res) {
  const list = await adminService.listDrives({ status: req.query.status });
  res.json({ drives: list });
}

export async function getDrive(req, res) {
  const id = parseInt(req.params.id, 10);
  const drive = await adminService.getDriveById(id);
  if (!drive) return res.status(404).json({ error: 'Drive not found' });
  res.json(drive);
}

export async function createDrive(req, res) {
  const { companyId, role, ctc, eligibility, deadline, status, timelineStart, timelineEnd, minCgpa } = req.body;
  if (!companyId || !role) return res.status(400).json({ error: 'companyId and role required' });
  const id = await adminService.createDrive({
    companyId: parseInt(companyId, 10),
    role,
    ctc,
    eligibility,
    deadline: deadline || null,
    status: status || 'UPCOMING',
    timelineStart: timelineStart || null,
    timelineEnd: timelineEnd || null,
    minCgpa: minCgpa != null && minCgpa !== '' ? parseFloat(minCgpa) : null,
  });
  await adminService.createAuditLog('ADMIN', req.adminId, 'DRIVE_CREATE', { driveId: id, role });
  const studentIds = await adminService.getStudentIdsAll();
  await notificationService.notifyStudents(studentIds, 'New placement drive', `New drive: ${role}. Check the portal.`, '/student/drives');
  res.status(201).json({ id, message: 'Drive created' });
}

export async function updateDrive(req, res) {
  const id = parseInt(req.params.id, 10);
  const body = { ...req.body };
  if (body.companyId !== undefined) body.companyId = parseInt(body.companyId, 10);
  if (body.minCgpa !== undefined) body.minCgpa = body.minCgpa === '' ? null : parseFloat(body.minCgpa);
  const ok = await adminService.updateDrive(id, body);
  if (!ok) return res.status(400).json({ error: 'No valid fields to update' });
  await adminService.createAuditLog('ADMIN', req.adminId, 'DRIVE_UPDATE', { driveId: id });
  const drive = await adminService.getDriveById(id);
  const studentIds = await adminService.getStudentIdsByDrive(id);
  await notificationService.notifyStudents(studentIds, 'Drive updated', `Drive "${drive?.role}" has been updated.`, '/student/drives');
  res.json({ message: 'Updated' });
}

export async function deleteDrive(req, res) {
  const id = parseInt(req.params.id, 10);
  const ok = await adminService.deleteDrive(id);
  if (!ok) return res.status(404).json({ error: 'Drive not found' });
  await adminService.createAuditLog('ADMIN', req.adminId, 'DRIVE_DELETE', { driveId: id });
  res.json({ message: 'Deleted' });
}

// Application status
export async function updateApplicationStatus(req, res) {
  const id = parseInt(req.params.id, 10);
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'status required' });
  const app = await applicationService.getApplicationById(id);
  if (!app) return res.status(404).json({ error: 'Application not found' });
  const ok = await applicationService.updateApplicationStatus(id, status.toUpperCase());
  if (!ok) return res.status(400).json({ error: 'Invalid status or update failed' });
  await adminService.createAuditLog('ADMIN', req.adminId, 'APPLICATION_STATUS_UPDATE', { applicationId: id, status: status.toUpperCase(), studentId: app.studentId });
  await notificationService.notifyStudent(app.studentId, 'Application status updated', `Your application status is now: ${status}.`, '/student/applications');
  res.json({ message: 'Status updated' });
}

// Drive students + export
export async function getDriveStudents(req, res) {
  const driveId = parseInt(req.params.driveId, 10);
  const { status } = req.query;
  const list = await adminService.getDriveStudents(driveId, status);
  res.json({ students: list });
}

export async function exportDriveStudents(req, res) {
  const driveId = parseInt(req.params.driveId, 10);
  const list = await adminService.getDriveStudents(driveId);
  const columns = [
    { header: 'Dept No', key: 'deptNo', width: 18 },
    { header: 'Name', key: 'name', width: 22 },
    { header: 'Department', key: 'department', width: 14 },
    { header: 'CGPA', key: 'cgpa', width: 10 },
    { header: 'Email', key: 'email', width: 28 },
    { header: 'Status', key: 'status', width: 14 },
    { header: 'Applied At', key: 'appliedAt', width: 20 },
  ];
  const rows = list.map((s) => ({
    deptNo: s.deptNo,
    name: s.name,
    department: s.department,
    cgpa: s.cgpa,
    email: s.email,
    status: s.status,
    appliedAt: s.appliedAt,
  }));
  const wb = await buildStudentsWorkbook(rows, columns);
  const buffer = await writeWorkbookToBuffer(wb);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=drive_${driveId}_students.xlsx`);
  res.send(buffer);
}

// Offer upload (only when application status = SELECTED)
export async function uploadOffer(req, res) {
  if (!req.file) return res.status(400).json({ error: 'PDF file required' });
  const applicationId = parseInt(req.params.id, 10);
  const { offerDeadline } = req.body;
  if (!offerDeadline) return res.status(400).json({ error: 'offerDeadline required' });

  const [apps] = await pool.query('SELECT * FROM applications WHERE id = ?', [applicationId]);
  const app = apps[0];
  if (!app) return res.status(404).json({ error: 'Application not found' });
  if (app.status !== 'SELECTED') {
    return res.status(400).json({ error: 'Offer can only be uploaded when application status is SELECTED' });
  }

  const [existing] = await pool.query('SELECT id FROM offers WHERE applicationId = ?', [applicationId]);
  if (existing.length) return res.status(400).json({ error: 'Offer already exists for this application' });

  const relativePath = path.basename(req.file.path);
  await pool.query(
    'INSERT INTO offers (applicationId, offerPdfPath, offerDeadline, decision) VALUES (?, ?, ?, ?)',
    [applicationId, relativePath, offerDeadline, 'PENDING']
  );
  await adminService.createAuditLog('ADMIN', req.adminId, 'OFFER_UPLOAD', { applicationId, studentId: app.studentId, offerDeadline });
  await notificationService.notifyStudent(app.studentId, 'Offer letter uploaded', 'Your offer letter is available. Please view and accept/reject before the deadline.', '/student/offers');
  res.status(201).json({ message: 'Offer uploaded' });
}

export const uploadOfferMulter = upload.single('offerPdf');

// Events CRUD
export async function listEvents(req, res) {
  const list = await adminService.listEvents({ type: req.query.type });
  res.json({ events: list });
}

export async function getEvent(req, res) {
  const id = parseInt(req.params.id, 10);
  const event = await adminService.getEventById(id);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  res.json(event);
}

export async function createEvent(req, res) {
  const { type, driveId, title, startTime, endTime, location, description } = req.body;
  if (!type || !title || !startTime || !endTime) return res.status(400).json({ error: 'type, title, startTime, endTime required' });
  const id = await adminService.createEvent({
    type,
    driveId: driveId ? parseInt(driveId, 10) : null,
    title,
    startTime,
    endTime,
    location,
    description,
  });
  await adminService.createAuditLog('ADMIN', req.adminId, 'EVENT_CREATE', { eventId: id, title });
  const studentIds = await adminService.getStudentIdsAll();
  await notificationService.notifyStudents(studentIds, 'New event', title, '/student/events');
  res.status(201).json({ id, message: 'Event created' });
}

export async function updateEvent(req, res) {
  const id = parseInt(req.params.id, 10);
  const ok = await adminService.updateEvent(id, req.body);
  if (!ok) return res.status(400).json({ error: 'No valid fields to update' });
  await adminService.createAuditLog('ADMIN', req.adminId, 'EVENT_UPDATE', { eventId: id });
  const event = await adminService.getEventById(id);
  const regs = await adminService.getEventRegistrations(id);
  const studentIds = regs.map((r) => r.studentId);
  if (studentIds.length) {
    await notificationService.notifyStudents(studentIds, 'Event updated', event?.title ?? 'Event updated.', '/student/events');
  }
  res.json({ message: 'Updated' });
}

export async function deleteEvent(req, res) {
  const id = parseInt(req.params.id, 10);
  const ok = await adminService.deleteEvent(id);
  if (!ok) return res.status(404).json({ error: 'Event not found' });
  await adminService.createAuditLog('ADMIN', req.adminId, 'EVENT_DELETE', { eventId: id });
  res.json({ message: 'Deleted' });
}

export async function getEventRegistrations(req, res) {
  const eventId = parseInt(req.params.eventId, 10);
  const list = await adminService.getEventRegistrations(eventId);
  res.json({ registrations: list });
}

export async function exportEventRegistrations(req, res) {
  const eventId = parseInt(req.params.eventId, 10);
  const list = await adminService.getEventRegistrations(eventId);
  const columns = [
    { header: 'Dept No', key: 'deptNo', width: 18 },
    { header: 'Name', key: 'name', width: 22 },
    { header: 'Department', key: 'department', width: 14 },
    { header: 'Email', key: 'email', width: 28 },
    { header: 'Registered At', key: 'registeredAt', width: 20 },
  ];
  const rows = list.map((r) => ({
    deptNo: r.deptNo,
    name: r.name,
    department: r.department,
    email: r.email,
    registeredAt: r.registeredAt,
  }));
  const wb = await buildEventRegistrationsWorkbook(rows, columns);
  const buffer = await writeWorkbookToBuffer(wb);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=event_${eventId}_registrations.xlsx`);
  res.send(buffer);
}

// Notifications broadcast
export async function broadcastNotification(req, res) {
  const { target, department, driveId, title, message, link } = req.body;
  if (!title) return res.status(400).json({ error: 'title required' });

  let studentIds = [];
  if (target === 'all') {
    studentIds = await adminService.getStudentIdsAll();
  } else if (target === 'department' && department) {
    studentIds = await adminService.getStudentIdsByDepartment(department);
  } else if (target === 'drive' && driveId) {
    studentIds = await adminService.getStudentIdsByDrive(parseInt(driveId, 10));
  } else if (target === 'selected' && driveId) {
    studentIds = await adminService.getStudentIdsSelectedInDrive(parseInt(driveId, 10));
  }
  await notificationService.notifyStudents(studentIds, title, message ?? '', link ?? null);
  res.json({ message: 'Notification sent', count: studentIds.length });
}

// Placement report
export async function getPlacementReport(req, res) {
  const data = await adminService.getPlacementReport();
  res.json(data);
}

// Expiring offers (deadline in 48h)
export async function getExpiringOffers(req, res) {
  const hours = parseInt(req.query.hours, 10) || 48;
  const list = await adminService.getExpiringOffers(hours);
  res.json({ offers: list });
}

// Audit log
export async function getAuditLogs(req, res) {
  const { actorType, actorId, action, fromDate, limit, offset } = req.query;
  const data = await adminService.getAuditLogs({ actorType, actorId, action, fromDate, limit, offset });
  res.json(data);
}

// Company notes
export async function getCompanyNotes(req, res) {
  const companyId = parseInt(req.params.id, 10);
  const notes = await adminService.getCompanyNotes(companyId);
  res.json({ notes });
}

export async function addCompanyNote(req, res) {
  const companyId = parseInt(req.params.id, 10);
  const { note } = req.body;
  if (!note || !note.trim()) return res.status(400).json({ error: 'note required' });
  const id = await adminService.addCompanyNote(companyId, req.adminId, note.trim());
  await adminService.createAuditLog('ADMIN', req.adminId, 'COMPANY_NOTE_ADD', { companyId, noteId: id });
  res.status(201).json({ id, message: 'Note added' });
}

// Duplicate event
export async function duplicateEvent(req, res) {
  const eventId = parseInt(req.params.id, 10);
  const newId = await adminService.duplicateEvent(eventId);
  if (!newId) return res.status(404).json({ error: 'Event not found' });
  await adminService.createAuditLog('ADMIN', req.adminId, 'EVENT_DUPLICATE', { sourceEventId: eventId, newEventId: newId });
  res.status(201).json({ id: newId, message: 'Event duplicated' });
}

// Student context (for side panel)
export async function getStudentContext(req, res) {
  const studentId = parseInt(req.params.id, 10);
  const data = await adminService.getStudentWithContext(studentId);
  if (!data) return res.status(404).json({ error: 'Student not found' });
  res.json(data);
}

// Eligibility check (query: driveId)
export async function checkEligible(req, res) {
  const studentId = parseInt(req.params.studentId, 10);
  const driveId = parseInt(req.query.driveId, 10);
  if (!driveId) return res.status(400).json({ error: 'driveId query required' });
  const result = await adminService.checkEligible(studentId, driveId);
  res.json(result);
}

// Bulk student import (CSV/Excel) — simple CSV: header row then data, comma-separated
function parseCsvSimple(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const lines = raw.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/\s+/g, ''));
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim());
    const row = {};
    headers.forEach((h, j) => { row[h] = values[j] ?? ''; });
    rows.push(row);
  }
  return rows.map((r) => ({
    deptNo: r.deptno ?? r.dept_no ?? '',
    name: r.name ?? '',
    password: r.password ?? r.dob ?? r.dobpassword ?? '',
    department: r.department ?? r.dept ?? '',
    cgpa: r.cgpa ?? '',
    email: r.email ?? '',
    phone: r.phone ?? '',
  }));
}

export async function bulkImportStudents(req, res) {
  if (!req.file) return res.status(400).json({ error: 'File required (CSV or Excel)' });
  const ext = (path.extname(req.file.originalname) || '').toLowerCase();
  let rows = [];
  if (ext === '.csv') {
    rows = parseCsvSimple(req.file.path);
  } else if (['.xlsx', '.xls'].includes(ext)) {
    const ExcelJS = (await import('exceljs')).default;
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(req.file.path);
    const ws = wb.worksheets[0];
    if (!ws) return res.status(400).json({ error: 'No sheet in workbook' });
    const cols = {};
    ws.getRow(1).eachCell((cell, colNumber) => {
      const key = (cell.value && cell.value.toString().toLowerCase().replace(/\s+/g, '')) || `col${colNumber}`;
      cols[colNumber] = key;
    });
    for (let i = 2; i <= ws.rowCount; i++) {
      const row = {};
      ws.getRow(i).eachCell((cell, colNumber) => {
        const k = cols[colNumber] || `col${colNumber}`;
        row[k] = cell.value != null ? cell.value.toString() : '';
      });
      if (Object.keys(row).length) rows.push(row);
    }
    // Map common headers: deptno, name, password/dob, department, cgpa, email, phone
    rows = rows.map((r) => ({
      deptNo: r.deptno ?? r.dept_no ?? r.deptno ?? '',
      name: r.name ?? '',
      password: r.password ?? r.dob ?? r.dobpassword ?? '',
      department: r.department ?? r.dept ?? '',
      cgpa: r.cgpa ?? '',
      email: r.email ?? '',
      phone: r.phone ?? '',
    }));
  } else {
    return res.status(400).json({ error: 'Use CSV or Excel (.xlsx, .xls)' });
  }
  if (rows.length === 0) return res.status(400).json({ error: 'No rows to import' });
  const result = await adminService.bulkImportStudents(rows);
  await adminService.createAuditLog('ADMIN', req.adminId, 'STUDENTS_BULK_IMPORT', { created: result.created, errors: result.errors.length });
  if (req.file.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
  res.json(result);
}

const IMPORTS_DIR = path.join(path.dirname(OFFERS_DIR), 'imports');
function ensureImportsDir() {
  if (!fs.existsSync(IMPORTS_DIR)) fs.mkdirSync(IMPORTS_DIR, { recursive: true });
}
export const bulkImportMulter = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      ensureImportsDir();
      cb(null, IMPORTS_DIR);
    },
    filename: (req, file, cb) => cb(null, `import_${Date.now()}_${Math.random().toString(36).slice(2)}${path.extname(file.originalname) || '.csv'}`),
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
}).single('file');

// Admin profile (change password)
export async function updateAdminProfile(req, res) {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) return res.status(400).json({ error: 'newPassword required (min 6 chars)' });
  const [[admin]] = await pool.query('SELECT id, password_hash FROM admins WHERE id = ?', [req.adminId]);
  if (!admin) return res.status(404).json({ error: 'Admin not found' });
  const match = await bcrypt.compare(currentPassword || '', admin.password_hash);
  if (!match) return res.status(400).json({ error: 'Current password incorrect' });
  const newHash = await bcrypt.hash(newPassword, 10);
  await adminService.updateAdminPassword(req.adminId, newHash);
  await adminService.createAuditLog('ADMIN', req.adminId, 'ADMIN_PASSWORD_CHANGE', {});
  res.json({ message: 'Password updated' });
}
