import type { Request, Response } from 'express';
import { User } from '../models/User.js';
import { AppError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

// Minimal public info — no email, no password hash. Used anywhere the UI needs
// to show "who posted this job" / "who you're messaging" without exposing PII.
export const getPublicUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id).select('name role createdAt');
  if (!user) throw new AppError('User not found.', 404);
  res.json({
    user: { id: user._id.toString(), name: user.name, role: user.role, createdAt: user.createdAt },
  });
});
