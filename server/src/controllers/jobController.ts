import type { Request, Response } from 'express';
import { Job } from '../models/Job.js';
import { AppError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const listJobs = asyncHandler(async (req: Request, res: Response) => {
  const { search, category, experienceLevel, jobType, sort, clientId } = req.query as Record<string, string>;

  const filter: Record<string, unknown> = {};
  if (clientId) {
    // Owner view: show all of a client's own jobs regardless of status.
    filter.clientId = clientId;
  } else {
    filter.status = 'open';
  }
  if (category) filter.category = category;
  if (experienceLevel) filter.experienceLevel = experienceLevel;
  if (jobType) filter.jobType = jobType;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { skills: { $regex: search, $options: 'i' } },
    ];
  }

  const sortSpec: Record<string, 1 | -1> = sort === 'budget' ? { budgetMax: -1 } : { createdAt: -1 };
  const jobs = await Job.find(filter).sort(sortSpec);
  res.json({ jobs });
});

export const getJob = asyncHandler(async (req: Request, res: Response) => {
  const job = await Job.findById(req.params.id);
  if (!job) throw new AppError('Job not found.', 404);
  res.json({ job });
});

export const createJob = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, category, skills, budgetMin, budgetMax, jobType, experienceLevel, deadlineDays } =
    req.body;

  if (!title || !description || !category || budgetMin == null || budgetMax == null || !jobType || !experienceLevel || !deadlineDays) {
    throw new AppError('Missing required job fields.');
  }
  if (Number(budgetMin) > Number(budgetMax)) {
    throw new AppError('Minimum budget cannot exceed maximum budget.');
  }

  const job = await Job.create({
    clientId: req.user!.userId,
    title,
    description,
    category,
    skills: Array.isArray(skills) ? skills : [],
    budgetMin,
    budgetMax,
    jobType,
    experienceLevel,
    deadlineDays,
  });

  res.status(201).json({ job });
});

async function assertOwner(jobId: string, userId: string) {
  const job = await Job.findById(jobId);
  if (!job) throw new AppError('Job not found.', 404);
  if (job.clientId.toString() !== userId) {
    throw new AppError('You can only manage your own jobs.', 403);
  }
  return job;
}

export const updateJob = asyncHandler(async (req: Request, res: Response) => {
  const job = await assertOwner(req.params.id, req.user!.userId);
  if (job.status !== 'open') {
    throw new AppError('Only open jobs can be edited. Close or fulfil proposals reset this.', 400);
  }

  const { title, description, category, skills, budgetMin, budgetMax, jobType, experienceLevel, deadlineDays } =
    req.body;

  const nextMin = budgetMin != null ? Number(budgetMin) : job.budgetMin;
  const nextMax = budgetMax != null ? Number(budgetMax) : job.budgetMax;
  if (nextMin > nextMax) {
    throw new AppError('Minimum budget cannot exceed maximum budget.');
  }

  if (title != null) job.title = title;
  if (description != null) job.description = description;
  if (category != null) job.category = category;
  if (Array.isArray(skills)) job.skills = skills;
  if (budgetMin != null) job.budgetMin = nextMin;
  if (budgetMax != null) job.budgetMax = nextMax;
  if (jobType != null) job.jobType = jobType;
  if (experienceLevel != null) job.experienceLevel = experienceLevel;
  if (deadlineDays != null) job.deadlineDays = deadlineDays;

  await job.save();
  res.json({ job });
});

export const closeJob = asyncHandler(async (req: Request, res: Response) => {
  const job = await assertOwner(req.params.id, req.user!.userId);
  if (job.status !== 'open') {
    throw new AppError('Only open jobs can be closed.', 400);
  }
  job.status = 'cancelled';
  await job.save();
  res.json({ job });
});
