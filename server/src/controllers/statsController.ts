import type { Request, Response } from 'express';
import { User } from '../models/User.js';
import { Job } from '../models/Job.js';
import { Contract } from '../models/Contract.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const CATEGORIES = ['Web Development', 'Mobile Development', 'Design', 'Writing'];

export const getPlatformStats = asyncHandler(async (_req: Request, res: Response) => {
  const [freelancerCount, openJobCount, contractsCompleted, categoryCounts] = await Promise.all([
    User.countDocuments({ role: 'freelancer' }),
    Job.countDocuments({ status: 'open' }),
    Contract.countDocuments({ status: 'completed' }),
    Promise.all(CATEGORIES.map((c) => Job.countDocuments({ category: c, status: 'open' }))),
  ]);

  const jobsByCategory: Record<string, number> = {};
  CATEGORIES.forEach((c, i) => (jobsByCategory[c] = categoryCounts[i]));

  res.json({
    freelancerCount,
    openJobCount,
    contractsCompleted,
    jobsByCategory,
  });
});