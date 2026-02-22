import { Router } from 'express';
import { authAdmin } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/role.js';
import * as chatController from '../controllers/chat.controller.js';

const router = Router();
router.use(authAdmin);
router.use(requireAdmin);

router.get('/unread-total', chatController.getAdminUnreadTotal);
router.get('/rooms', chatController.getAdminRooms);
router.get('/rooms/:roomId/messages', chatController.getAdminMessages);
router.post('/rooms/:roomId/messages', chatController.postAdminMessage);
router.post('/rooms/:roomId/seen', chatController.postAdminMarkSeen);
router.post('/rooms/:roomId/voice', chatController.uploadVoice, chatController.postAdminVoice);
router.get('/voice/:filename', chatController.getVoiceNote);

export default router;
