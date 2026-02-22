import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';

const router = Router();

router.post('/student/login', authController.studentLogin);
router.post('/admin/login', authController.adminLogin);

export default router;
