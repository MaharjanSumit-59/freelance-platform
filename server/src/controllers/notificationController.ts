import type { Request, Response } from 'express';
import { Notification } from '../models/Notification.js';
import { AppError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const listMyNotifications = asyncHandler(async (req: Request, res: Response) => {
  const notifications = await Notification.find({ userId: req.user!.userId }).sort({ createdAt: -1 });
  res.json({ notifications });
});

export const markRead = asyncHandler(async (req: Request, res: Response) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) throw new AppError('Notification not found.', 404);
  if (notification.userId.toString() !== req.user!.userId) {
    throw new AppError('Not your notification.', 403);
  }
  notification.read = true;
  await notification.save();
  res.json({ notification });
});

export const markAllRead = asyncHandler(async (req: Request, res: Response) => {
  await Notification.updateMany({ userId: req.user!.userId, read: false }, { $set: { read: true } });
  res.json({ success: true });
});
