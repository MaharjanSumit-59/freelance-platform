import type { Request, Response } from 'express';
import { User } from '../models/User.js';
import { Job } from '../models/Job.js';
import { Contract } from '../models/Contract.js';
import { AppError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const getClientProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user || user.role !== 'client') throw new AppError('Client not found.', 404);

  const jobsPosted = await Job.countDocuments({ clientId: user._id });
  const contractsCompleted = await Contract.countDocuments({ clientId: user._id, status: 'completed' });

  res.json({
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
    profile: user.clientProfile ?? null,
    stats: {
      jobsPosted,
      contractsCompleted,
    },
  });
});

export const updateClientProfile = asyncHandler(async (req: Request, res: Response) => {
  if (req.user!.userId !== req.params.id) {
    throw new AppError('You can only edit your own profile.', 403);
  }
  const user = await User.findById(req.params.id);
  if (!user || user.role !== 'client') throw new AppError('Client not found.', 404);

  const { companyName, about, location } = req.body;
  user.clientProfile = {
    companyName: companyName ?? user.clientProfile?.companyName ?? '',
    about: about ?? user.clientProfile?.about ?? '',
    location: location ?? user.clientProfile?.location ?? '',
  };
  await user.save();

  res.json({ profile: user.clientProfile });
});
