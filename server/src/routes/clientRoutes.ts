import { Router } from 'express';
import { getClientProfile, updateClientProfile } from '../controllers/clientController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/:id', getClientProfile);
router.put('/:id', requireAuth, updateClientProfile);

export default router;
