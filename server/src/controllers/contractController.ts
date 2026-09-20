import type { Request, Response } from 'express';
import { Contract } from '../models/Contract.js';
import { Job } from '../models/Job.js';
import { AppError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const listMyContracts = asyncHandler(async (req: Request, res: Response) => {
  const { userId, role } = req.user!;
  const filter = role === 'client' ? { clientId: userId } : { freelancerId: userId };
  const contracts = await Contract.find(filter).sort({ startDate: -1 });
  res.json({ contracts });
});

async function loadContractAsParty(contractId: string, userId: string) {
  const contract = await Contract.findById(contractId);
  if (!contract) throw new AppError('Contract not found.', 404);
  if (contract.clientId.toString() !== userId && contract.freelancerId.toString() !== userId) {
    throw new AppError('You are not a party to this contract.', 403);
  }
  return contract;
}

export const submitMilestone = asyncHandler(async (req: Request, res: Response) => {
  const contract = await loadContractAsParty(req.params.id, req.user!.userId);
  if (contract.freelancerId.toString() !== req.user!.userId) {
    throw new AppError('Only the freelancer can submit a milestone.', 403);
  }
  const milestone = contract.milestones.id(req.params.milestoneId);
  if (!milestone) throw new AppError('Milestone not found.', 404);
  if (milestone.status !== 'pending') throw new AppError('This milestone has already been submitted.', 409);

  milestone.status = 'submitted';
  await contract.save();
  res.json({ contract });
});

export const approveMilestone = asyncHandler(async (req: Request, res: Response) => {
  const contract = await loadContractAsParty(req.params.id, req.user!.userId);
  if (contract.clientId.toString() !== req.user!.userId) {
    throw new AppError('Only the client can approve a milestone.', 403);
  }
  const milestone = contract.milestones.id(req.params.milestoneId);
  if (!milestone) throw new AppError('Milestone not found.', 404);
  if (milestone.status !== 'submitted') throw new AppError('This milestone is not awaiting approval.', 409);

  milestone.status = 'approved';
  await contract.save();
  res.json({ contract });
});

export const completeContract = asyncHandler(async (req: Request, res: Response) => {
  const contract = await loadContractAsParty(req.params.id, req.user!.userId);
  if (contract.clientId.toString() !== req.user!.userId) {
    throw new AppError('Only the client can complete a contract.', 403);
  }
  const allApproved = contract.milestones.every((m) => m.status === 'approved');
  if (!allApproved) throw new AppError('All milestones must be approved before completing the contract.', 409);

  contract.status = 'completed';
  await contract.save();

  await Job.findByIdAndUpdate(contract.jobId, { status: 'completed' });

  res.json({ contract });
});
