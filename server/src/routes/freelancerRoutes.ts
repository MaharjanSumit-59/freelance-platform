import { Router } from 'express';
import { getFreelancerProfile, updateFreelancerProfile } from '../controllers/freelancerController.js';
import { requireAuth } from '../middleware/auth.js';
import { listReviewsForUser } from '../controllers/reviewController.js';

const router = Router();

router.get('/:id', getFreelancerProfile);
router.put('/:id', requireAuth, updateFreelancerProfile);
router.get('/:id/reviews', listReviewsForUser);

export default router;
