import { defaultMilestones } from '../utils/milestones.js';
import type { Request, Response } from 'express';
import { Proposal, type ProposalDoc } from '../models/Proposal.js';
import { Job, type JobDoc } from '../models/Job.js';
import { Contract } from '../models/Contract.js';
import { AppError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { notify } from '../utils/notify.js';

import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'cvs');

async function createContractForProposal(job: JobDoc, proposal: ProposalDoc) {
  const startDate = new Date();
  const deadline = new Date(startDate);
  deadline.setDate(deadline.getDate() + proposal.estimatedDays);

  return Contract.create({
    jobId: job._id,
    clientId: job.clientId,
    freelancerId: proposal.freelancerId,
    agreedPrice: proposal.bidAmount,
    startDate,
    deadline,
    milestones: defaultMilestones(proposal.bidAmount),
  });
}

export const createProposal = asyncHandler(async (req: Request, res: Response) => {
  const { jobId } = req.params;
  const { coverLetter, bidAmount, estimatedDays } = req.body;

  if (!coverLetter || !bidAmount || !estimatedDays) {
    throw new AppError('Cover letter, bid amount, and estimated days are all required.');
  }

  const job = await Job.findById(jobId);
  if (!job) throw new AppError('Job not found.', 404);
  if (job.status !== 'open') {
    throw new AppError('This job is no longer accepting proposals.', 409);
  }

  if (Number(bidAmount) < job.budgetMin || Number(bidAmount) > job.budgetMax) {
    throw new AppError(
      `Your bid must be between $${job.budgetMin} and $${job.budgetMax} for this job.`
    );
  }

  if (Number(estimatedDays) > job.deadlineDays) {
    throw new AppError(
      `Your estimated timeline can't exceed the client's ${job.deadlineDays}-day deadline.`
    );
  }

  if (Number(estimatedDays) <= 0) {
    throw new AppError('Estimated days must be a positive number.');
  }

  let proposal;

  try {
    proposal = await Proposal.create({
      jobId,
      freelancerId: req.user!.userId,
      coverLetter,
      bidAmount,
      estimatedDays,
      ...(req.file
        ? {
            cvFileName: req.file.filename,
            cvOriginalName: req.file.originalname,
          }
        : {}),
    });
  } catch (err: unknown) {
    if (
      err &&
      typeof err === 'object' &&
      'code' in err &&
      (err as { code: number }).code === 11000
    ) {
      throw new AppError('You have already submitted a proposal for this job.', 409);
    }

    throw err;
  }

  job.proposalCount += 1;
  await job.save();

  await notify(
    job.clientId,
    'proposal_received',
    `New proposal on "${job.title}"`,
    job._id.toString()
  );

  res.status(201).json({ proposal });
});

export const listProposalsForJob = asyncHandler(async (req: Request, res: Response) => {
  const { jobId } = req.params;

  const job = await Job.findById(jobId);
  if (!job) throw new AppError('Job not found.', 404);

  if (job.clientId.toString() !== req.user!.userId) {
    throw new AppError('You can only view proposals on your own jobs.', 403);
  }

  const proposals = await Proposal.find({ jobId }).sort({ createdAt: -1 });

  res.json({ proposals });
});

export const listMyProposals = asyncHandler(async (req: Request, res: Response) => {
  const proposals = await Proposal.find({
    freelancerId: req.user!.userId,
  }).sort({ createdAt: -1 });

  res.json({ proposals });
});

export const acceptProposal = asyncHandler(async (req: Request, res: Response) => {
  const proposal = await Proposal.findById(req.params.id);
  if (!proposal) throw new AppError('Proposal not found.', 404);

  const job = await Job.findById(proposal.jobId);
  if (!job) throw new AppError('Job not found.', 404);

  if (job.clientId.toString() !== req.user!.userId) {
    throw new AppError('You can only hire for your own jobs.', 403);
  }

  // A proposal can already be "accepted" but have no contract if an earlier
  // accept attempt failed halfway. In that case we finish the job instead of
  // rejecting the request, so the client can just click Hire again.
  const alreadyAccepted = proposal.status === 'accepted';

  if (alreadyAccepted) {
    const existing = await Contract.findOne({
      jobId: job._id,
      freelancerId: proposal.freelancerId,
    });

    if (existing) {
      throw new AppError('This proposal has already been accepted.', 409);
    }
  } else if (proposal.status !== 'pending') {
    throw new AppError('This proposal has already been decided.', 409);
  } else if (job.status !== 'open') {
    throw new AppError('This job is no longer open for hiring.', 409);
  }

  // Create the contract FIRST. If it fails validation, nothing else has been
  // changed yet, so the proposal stays "pending" and the client can retry.
  const contract = await createContractForProposal(job, proposal);

  try {
    if (!alreadyAccepted) {
      proposal.status = 'accepted';
      await proposal.save();
    }

    await Proposal.updateMany(
      {
        jobId: job._id,
        _id: { $ne: proposal._id },
        status: 'pending',
      },
      {
        $set: { status: 'rejected' },
      }
    );

    job.status = 'in_progress';
    await job.save();
  } catch (err) {
    // Don't leave an orphaned contract behind if a later step fails.
    await Contract.findByIdAndDelete(contract._id);
    throw err;
  }

  await notify(
    proposal.freelancerId,
    'hired',
    `You were hired for "${job.title}"`,
    contract._id.toString()
  );

  res.json({ proposal, contract });
});

export const rejectProposal = asyncHandler(async (req: Request, res: Response) => {
  const proposal = await Proposal.findById(req.params.id);
  if (!proposal) throw new AppError('Proposal not found.', 404);

  const job = await Job.findById(proposal.jobId);
  if (!job) throw new AppError('Job not found.', 404);

  if (job.clientId.toString() !== req.user!.userId) {
    throw new AppError('You can only manage proposals on your own jobs.', 403);
  }

  if (proposal.status !== 'pending') {
    throw new AppError('This proposal has already been decided.', 409);
  }

  proposal.status = 'rejected';
  await proposal.save();

  res.json({ proposal });
});

export const downloadProposalCv = asyncHandler(async (req: Request, res: Response) => {
  const proposal = await Proposal.findById(req.params.id);

  if (!proposal || !proposal.cvFileName) {
    throw new AppError('No CV was submitted with this proposal.', 404);
  }

  const job = await Job.findById(proposal.jobId);
  if (!job) throw new AppError('Job not found.', 404);

  const isOwner = proposal.freelancerId.toString() === req.user!.userId;
  const isJobClient = job.clientId.toString() === req.user!.userId;

  if (!isOwner && !isJobClient) {
    throw new AppError('You are not authorized to view this CV.', 403);
  }

  const filePath = path.join(UPLOAD_DIR, proposal.cvFileName);

  res.download(filePath, proposal.cvOriginalName || 'cv.pdf');
});

