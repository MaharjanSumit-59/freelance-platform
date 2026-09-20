import type { Request, Response } from 'express';
import { User } from '../models/User.js';
import { Review } from '../models/Review.js';
import { Contract } from '../models/Contract.js';
import { AppError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const getFreelancerProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user || user.role !== 'freelancer') throw new AppError('Freelancer not found.', 404);

  const reviews = await Review.find({ revieweeId: user._id }).sort({ createdAt: -1 });
  const jobsCompleted = await Contract.countDocuments({ freelancerId: user._id, status: 'completed' });
  const totalEarnedAgg = await Contract.aggregate([
    { $match: { freelancerId: user._id, status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$agreedPrice' } } },
  ]);
  const totalEarned = totalEarnedAgg[0]?.total ?? 0;

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + (r.communication + r.quality + r.timeliness) / 3, 0) / reviews.length
      : 0;

  res.json({
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
    profile: user.freelancerProfile,
    stats: {
      rating: Number(avgRating.toFixed(1)),
      reviewCount: reviews.length,
      jobsCompleted,
      totalEarned,
    },
    reviews,
  });
});

export const updateFreelancerProfile = asyncHandler(async (req: Request, res: Response) => {
  if (req.user!.userId !== req.params.id) {
    throw new AppError('You can only edit your own profile.', 403);
  }
  const user = await User.findById(req.params.id);
  if (!user || user.role !== 'freelancer') throw new AppError('Freelancer not found.', 404);

  const { title, about, hourlyRate, skills, portfolio } = req.body;
  user.freelancerProfile = {
    title: title ?? user.freelancerProfile?.title ?? '',
    about: about ?? user.freelancerProfile?.about ?? '',
    hourlyRate: hourlyRate ?? user.freelancerProfile?.hourlyRate ?? 0,
    skills: skills ?? user.freelancerProfile?.skills ?? [],
    portfolio: portfolio ?? user.freelancerProfile?.portfolio ?? [],
  };
  await user.save();

  res.json({ profile: user.freelancerProfile });
});
