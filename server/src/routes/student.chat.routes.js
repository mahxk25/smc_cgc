import { Router } from 'express';
import { authStudent } from '../middleware/auth.js';
import * as chatController from '../controllers/chat.controller.js';

const router = Router();
router.use(authStudent);

router.get('/rooms', chatController.getStudentRooms);
router.get('/rooms/:roomId/messages', chatController.getStudentMessages);
router.post('/rooms/:roomId/messages', chatController.postStudentMessage);
router.post('/rooms/:roomId/seen', chatController.postStudentMarkSeen);
router.post('/rooms/:roomId/voice', chatController.uploadVoice, chatController.postStudentVoice);
router.get('/voice/:filename', chatController.getVoiceNote);

export default router;
