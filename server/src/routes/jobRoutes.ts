import { Router } from 'express';
import { listJobs, getJob, createJob, updateJob, closeJob } from '../controllers/jobController.js';
import { createProposal, listProposalsForJob } from '../controllers/proposalController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { uploadCv } from '../middleware/upload.js';

const router = Router();

router.get('/', listJobs);
router.get('/:id', getJob);
router.post('/', requireAuth, requireRole('client'), createJob);
router.put('/:id', requireAuth, requireRole('client'), updateJob);
router.post('/:id/close', requireAuth, requireRole('client'), closeJob);

router.post('/:jobId/proposals', requireAuth, requireRole('freelancer'), uploadCv.single('cv'), createProposal);
router.get('/:jobId/proposals', requireAuth, requireRole('client'), listProposalsForJob);

export default router;