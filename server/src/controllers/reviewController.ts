import type { Request, Response } from 'express';
import { Review } from '../models/Review.js';
import { Contract } from '../models/Contract.js';
import { AppError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { notify } from '../utils/notify.js';

export const createReview = asyncHandler(async (req: Request, res: Response) => {
  const { contractId, revieweeId, communication, quality, timeliness, comment } = req.body;

  if (!contractId || !revieweeId || !communication || !quality || !timeliness) {
    throw new AppError('Missing required review fields.');
  }

  const contract = await Contract.findById(contractId);
  if (!contract) throw new AppError('Contract not found.', 404);
  if (contract.status !== 'completed') throw new AppError('You can only review completed contracts.', 409);

  const reviewerId = req.user!.userId;
  const isParty =
    contract.clientId.toString() === reviewerId || contract.freelancerId.toString() === reviewerId;
  if (!isParty) throw new AppError('You are not a party to this contract.', 403);

  const expectedRevieweeId =
    contract.clientId.toString() === reviewerId
      ? contract.freelancerId.toString()
      : contract.clientId.toString();
  if (revieweeId !== expectedRevieweeId) {
    throw new AppError('revieweeId does not match the other party on this contract.');
  }

  let review;
  try {
    review = await Review.create({
      contractId,
      reviewerId,
      revieweeId,
      communication,
      quality,
      timeliness,
      comment: comment ?? '',
    });
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && (err as { code: number }).code === 11000) {
      throw new AppError('You have already reviewed this contract.', 409);
    }
    throw err;
  }

  await notify(revieweeId, 'review', 'You received a new review', contractId);

  res.status(201).json({ review });
});

export const listReviewsForUser = asyncHandler(async (req: Request, res: Response) => {
  const reviews = await Review.find({ revieweeId: req.params.userId }).sort({ createdAt: -1 });
  res.json({ reviews });
});

export const hasReviewedContract = asyncHandler(async (req: Request, res: Response) => {
  const existing = await Review.findOne({ contractId: req.params.contractId, reviewerId: req.user!.userId });
  res.json({ hasReviewed: Boolean(existing) });
});
