import { Router } from 'express';
import authRoutes from './authRoutes.js';
import jobRoutes from './jobRoutes.js';
import proposalRoutes from './proposalRoutes.js';
import contractRoutes from './contractRoutes.js';
import reviewRoutes from './reviewRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import freelancerRoutes from './freelancerRoutes.js';
import clientRoutes from './clientRoutes.js';
import userRoutes from './userRoutes.js';
import statsRoutes from './statsRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/jobs', jobRoutes);
router.use('/proposals', proposalRoutes);
router.use('/contracts', contractRoutes);
router.use('/reviews', reviewRoutes);
router.use('/notifications', notificationRoutes);
router.use('/freelancers', freelancerRoutes);
router.use('/clients', clientRoutes);
router.use('/users', userRoutes);
router.use('/stats', statsRoutes);

export default router;