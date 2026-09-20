import { Router } from 'express';
import {
  listMyContracts,
  submitMilestone,
  approveMilestone,
  completeContract,
} from '../controllers/contractController.js';
import { listMessages, sendMessage } from '../controllers/messageController.js';
import { hasReviewedContract } from '../controllers/reviewController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/mine', requireAuth, listMyContracts);
router.post('/:id/milestones/:milestoneId/submit', requireAuth, submitMilestone);
router.post('/:id/milestones/:milestoneId/approve', requireAuth, approveMilestone);
router.post('/:id/complete', requireAuth, completeContract);

router.get('/:contractId/messages', requireAuth, listMessages);
router.post('/:contractId/messages', requireAuth, sendMessage);

router.get('/:contractId/reviewed', requireAuth, hasReviewedContract);

export default router;
