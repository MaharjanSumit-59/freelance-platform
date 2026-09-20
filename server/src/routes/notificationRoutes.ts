import { Router } from 'express';
import { listMyNotifications, markRead, markAllRead } from '../controllers/notificationController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/mine', requireAuth, listMyNotifications);
router.post('/:id/read', requireAuth, markRead);
router.post('/read-all', requireAuth, markAllRead);

export default router;
