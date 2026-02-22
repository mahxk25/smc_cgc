import * as chatService from '../services/chat.service.js';
import * as notificationService from '../utils/notifications.js';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { VOICE_DIR } from '../utils/file.js';

const voiceStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, VOICE_DIR),
  filename: (req, file, cb) => cb(null, `voice_${Date.now()}_${Math.random().toString(36).slice(2)}.webm`),
});
const voiceUpload = multer({
  storage: voiceStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /\.(webm|ogg|mp3|m4a|wav)$/i.test(file.originalname) || (file.mimetype && file.mimetype.startsWith('audio/'));
    cb(null, !!ok);
  },
});
export const uploadVoice = voiceUpload.single('voice');

export async function getStudentRooms(req, res) {
  const rooms = await chatService.getRoomsForStudent(req.studentId);
  res.json({ rooms });
}

export async function getStudentMessages(req, res) {
  const roomId = parseInt(req.params.roomId, 10);
  if (!roomId) return res.status(400).json({ error: 'Invalid room ID' });
  const can = await chatService.studentCanAccessRoom(req.studentId, roomId);
  if (!can) return res.status(403).json({ error: 'You do not have access to this chat' });
  const beforeId = req.query.before ? parseInt(req.query.before, 10) : null;
  const messages = await chatService.getMessages(roomId, 80, beforeId);
  const room = await chatService.getRoomById(roomId);
  await chatService.markSeen(roomId, 'STUDENT', req.studentId);
  res.json({ room, messages });
}

async function notifyRoomStudents(roomId, excludeStudentId, preview, titleOverride = null) {
  const room = await chatService.getRoomById(roomId);
  const studentIds = await chatService.getStudentIdsInRoom(roomId);
  const toNotify = excludeStudentId ? studentIds.filter((id) => id !== excludeStudentId) : studentIds;
  if (toNotify.length && room) {
    const title = titleOverride || `New message in ${room.companyName}`;
    await notificationService.notifyStudents(toNotify, title, preview, `/student/chat?room=${roomId}`);
  }
}

export async function postStudentMessage(req, res) {
  const roomId = parseInt(req.params.roomId, 10);
  if (!roomId) return res.status(400).json({ error: 'Invalid room ID' });
  const can = await chatService.studentCanAccessRoom(req.studentId, roomId);
  if (!can) return res.status(403).json({ error: 'You do not have access to this chat' });
  const content = (req.body && req.body.content) ? String(req.body.content).trim() : null;
  const voicePath = req.file ? path.relative(VOICE_DIR, req.file.path).replace(/\\/g, '/') : null;
  if (!content && !voicePath) return res.status(400).json({ error: 'Message content or voice note required' });
  const messageId = await chatService.sendMessage(roomId, 'STUDENT', req.studentId, content, voicePath);
  const preview = content ? (content.slice(0, 50) + (content.length > 50 ? '…' : '')) : '🎤 Voice message';
  await notifyRoomStudents(roomId, req.studentId, preview);
  res.status(201).json({ messageId, message: 'Sent' });
}

export async function postStudentMarkSeen(req, res) {
  const roomId = parseInt(req.params.roomId, 10);
  if (!roomId) return res.status(400).json({ error: 'Invalid room ID' });
  const can = await chatService.studentCanAccessRoom(req.studentId, roomId);
  if (!can) return res.status(403).json({ error: 'Access denied' });
  await chatService.markSeen(roomId, 'STUDENT', req.studentId);
  res.json({ message: 'Seen' });
}

export async function postStudentVoice(req, res) {
  const roomId = parseInt(req.params.roomId, 10);
  if (!roomId) return res.status(400).json({ error: 'Invalid room ID' });
  const can = await chatService.studentCanAccessRoom(req.studentId, roomId);
  if (!can) return res.status(403).json({ error: 'You do not have access to this chat' });
  if (!req.file) return res.status(400).json({ error: 'Voice file required' });
  const voicePath = path.relative(VOICE_DIR, req.file.path).replace(/\\/g, '/');
  const content = (req.body && req.body.content) ? String(req.body.content).trim() : null;
  const messageId = await chatService.sendMessage(roomId, 'STUDENT', req.studentId, content, voicePath);
  await notifyRoomStudents(roomId, req.studentId, '🎤 Voice message');
  res.status(201).json({ messageId, message: 'Sent' });
}

export async function getAdminUnreadTotal(req, res) {
  const total = await chatService.getAdminUnreadTotal(req.adminId);
  res.json({ total });
}

export async function getAdminRooms(req, res) {
  const rooms = await chatService.getRoomsForAdmin(req.adminId);
  res.json({ rooms });
}

export async function getAdminMessages(req, res) {
  const roomId = parseInt(req.params.roomId, 10);
  if (!roomId) return res.status(400).json({ error: 'Invalid room ID' });
  const room = await chatService.getRoomById(roomId);
  if (!room) return res.status(404).json({ error: 'Room not found' });
  const beforeId = req.query.before ? parseInt(req.query.before, 10) : null;
  const messages = await chatService.getMessages(roomId, 80, beforeId);
  await chatService.markSeen(roomId, 'ADMIN', req.adminId);
  res.json({ room, messages });
}

export async function postAdminMessage(req, res) {
  const roomId = parseInt(req.params.roomId, 10);
  if (!roomId) return res.status(400).json({ error: 'Invalid room ID' });
  const room = await chatService.getRoomById(roomId);
  if (!room) return res.status(404).json({ error: 'Room not found' });
  const content = (req.body && req.body.content) ? String(req.body.content).trim() : null;
  const voicePath = req.file ? path.relative(VOICE_DIR, req.file.path).replace(/\\/g, '/') : null;
  if (!content && !voicePath) return res.status(400).json({ error: 'Message content or voice note required' });
  const messageId = await chatService.sendMessage(roomId, 'ADMIN', req.adminId, content, voicePath);
  const preview = content ? (content.slice(0, 50) + (content.length > 50 ? '…' : '')) : '🎤 Voice message';
  await notifyRoomStudents(roomId, null, preview, `${room.companyName} – New message`);
  res.status(201).json({ messageId, message: 'Sent' });
}

export async function postAdminMarkSeen(req, res) {
  const roomId = parseInt(req.params.roomId, 10);
  if (!roomId) return res.status(400).json({ error: 'Invalid room ID' });
  const room = await chatService.getRoomById(roomId);
  if (!room) return res.status(404).json({ error: 'Room not found' });
  await chatService.markSeen(roomId, 'ADMIN', req.adminId);
  res.json({ message: 'Seen' });
}

export async function postAdminVoice(req, res) {
  const roomId = parseInt(req.params.roomId, 10);
  if (!roomId) return res.status(400).json({ error: 'Invalid room ID' });
  const room = await chatService.getRoomById(roomId);
  if (!room) return res.status(404).json({ error: 'Room not found' });
  if (!req.file) return res.status(400).json({ error: 'Voice file required' });
  const voicePath = path.relative(VOICE_DIR, req.file.path).replace(/\\/g, '/');
  const content = (req.body && req.body.content) ? String(req.body.content).trim() : null;
  const messageId = await chatService.sendMessage(roomId, 'ADMIN', req.adminId, content, voicePath);
  await notifyRoomStudents(roomId, null, '🎤 Voice message', `${room.companyName} – New message`);
  res.status(201).json({ messageId, message: 'Sent' });
}

export async function getVoiceNote(req, res) {
  const filename = req.params.filename;
  if (!filename || filename.includes('..') || path.isAbsolute(filename)) return res.status(400).json({ error: 'Invalid file' });
  const safe = path.basename(filename);
  const filePath = path.join(VOICE_DIR, safe);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });
  const ext = path.extname(safe).toLowerCase();
  const mime = { '.webm': 'audio/webm', '.ogg': 'audio/ogg', '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4', '.wav': 'audio/wav' }[ext] || 'audio/webm';
  res.sendFile(path.resolve(filePath), { headers: { 'Content-Type': mime } });
}
