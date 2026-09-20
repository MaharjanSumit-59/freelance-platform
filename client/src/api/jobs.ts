import { apiFetch } from './client';
import { withId, withIds } from './normalize';
import type { Job, Proposal, ExperienceLevel, JobType } from '../types';

interface RawJob extends Omit<Job, 'id'> {
  _id: string;
}
interface RawProposal extends Omit<Proposal, 'id'> {
  _id: string;
}

export interface JobFilters {
  search?: string;
  category?: string;
  experienceLevel?: ExperienceLevel;
  jobType?: JobType;
  sort?: 'newest' | 'budget';
  clientId?: string; // owner view — returns all of that client's jobs, any status
}

export async function listJobs(filters: JobFilters = {}): Promise<Job[]> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const qs = params.toString();
  const res = await apiFetch<{ jobs: RawJob[] }>(`/jobs${qs ? `?${qs}` : ''}`);
  return withIds(res.jobs);
}

export async function getJob(jobId: string): Promise<Job> {
  const res = await apiFetch<{ job: RawJob }>(`/jobs/${jobId}`);
  return withId(res.job);
}

export async function createJob(input: {
  title: string;
  description: string;
  category: string;
  skills: string[];
  budgetMin: number;
  budgetMax: number;
  jobType: JobType;
  experienceLevel: ExperienceLevel;
  deadlineDays: number;
}): Promise<Job> {
  const res = await apiFetch<{ job: RawJob }>('/jobs', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return withId(res.job);
}

export async function updateJob(
  jobId: string,
  input: Partial<{
    title: string;
    description: string;
    category: string;
    skills: string[];
    budgetMin: number;
    budgetMax: number;
    jobType: JobType;
    experienceLevel: ExperienceLevel;
    deadlineDays: number;
  }>
): Promise<Job> {
  const res = await apiFetch<{ job: RawJob }>(`/jobs/${jobId}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
  return withId(res.job);
}

export async function closeJob(jobId: string): Promise<Job> {
  const res = await apiFetch<{ job: RawJob }>(`/jobs/${jobId}/close`, {
    method: 'POST',
  });
  return withId(res.job);
}

export async function submitProposal(
  jobId: string,
  input: { coverLetter: string; bidAmount: number; estimatedDays: number; cv?: File | null }
): Promise<Proposal> {
  const formData = new FormData();
  formData.append('coverLetter', input.coverLetter);
  formData.append('bidAmount', String(input.bidAmount));
  formData.append('estimatedDays', String(input.estimatedDays));
  if (input.cv) formData.append('cv', input.cv);

  const res = await apiFetch<{ proposal: RawProposal }>(`/jobs/${jobId}/proposals`, {
    method: 'POST',
    body: formData,
  });
  return withId(res.proposal);
}
export async function listProposalsForJob(jobId: string): Promise<Proposal[]> {
  const res = await apiFetch<{ proposals: RawProposal[] }>(`/jobs/${jobId}/proposals`);
  return withIds(res.proposals);
}
