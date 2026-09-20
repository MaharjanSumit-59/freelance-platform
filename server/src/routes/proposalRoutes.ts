import { Router } from 'express';
import { listMyProposals, acceptProposal, rejectProposal, downloadProposalCv } from '../controllers/proposalController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/mine', requireAuth, requireRole('freelancer'), listMyProposals);
router.post('/:id/accept', requireAuth, requireRole('client'), acceptProposal);
router.post('/:id/reject', requireAuth, requireRole('client'), rejectProposal);
router.get('/:id/cv', requireAuth, downloadProposalCv);

export default router;
