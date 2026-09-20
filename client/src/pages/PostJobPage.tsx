import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import * as jobsApi from '../api/jobs';
import { ApiError } from '../api/client';
import type { ExperienceLevel, JobType } from '../types';

const CATEGORIES = ['Web Development', 'Mobile Development', 'Design', 'Writing'];

export default function PostJobPage() {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const isEditMode = Boolean(jobId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [skillsInput, setSkillsInput] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [jobType, setJobType] = useState<JobType>('fixed');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('intermediate');
  const [deadlineDays, setDeadlineDays] = useState('14');

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEditMode);

  useEffect(() => {
    if (!jobId) return;
    jobsApi
      .getJob(jobId)
      .then((job) => {
        if (job.status !== 'open') {
          setError('This job can no longer be edited because it is no longer open.');
        }
        setTitle(job.title);
        setDescription(job.description);
        setCategory(job.category);
        setSkillsInput(job.skills.join(', '));
        setBudgetMin(String(job.budgetMin));
        setBudgetMax(String(job.budgetMax));
        setJobType(job.jobType);
        setExperienceLevel(job.experienceLevel);
        setDeadlineDays(String(job.deadlineDays));
      })
      .catch(() => setError('Could not load this job.'))
      .finally(() => setLoading(false));
  }, [jobId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const min = Number(budgetMin);
    const max = Number(budgetMax);
    const days = Number(deadlineDays);
    const skills = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (!title.trim() || !description.trim()) {
      setError('Title and description are required.');
      return;
    }
    if (!Number.isFinite(min) || !Number.isFinite(max) || min <= 0 || max <= 0) {
      setError('Enter a valid budget range.');
      return;
    }
    if (min > max) {
      setError('Minimum budget cannot exceed maximum budget.');
      return;
    }
    if (!Number.isFinite(days) || days <= 0) {
      setError('Enter a valid deadline in days.');
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      category,
      skills,
      budgetMin: min,
      budgetMax: max,
      jobType,
      experienceLevel,
      deadlineDays: days,
    };

    setSubmitting(true);
    try {
      if (isEditMode && jobId) {
        await jobsApi.updateJob(jobId, payload);
        navigate(`/client/jobs/${jobId}/proposals`);
      } else {
        const job = await jobsApi.createJob(payload);
        navigate(`/client/jobs/${job.id}/proposals`);
      }
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : `Could not ${isEditMode ? 'save' : 'post'} this job. Please try again.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center text-muted">Loading job...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-2xl font-bold text-ink">{isEditMode ? 'Edit job' : 'Post a job'}</h1>
        <p className="text-sm text-muted mt-1">
          {isEditMode
            ? 'Update the details below. Freelancers browsing will see your changes right away.'
            : "Describe what you need done. Freelancers will send proposals you can review and hire from."}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="text-sm font-medium text-ink block mb-1.5">Job title</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Build a responsive landing page"
              className="w-full border border-border rounded px-3 py-2.5 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-ink block mb-1.5">Description</label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              placeholder="What does the job involve? What does success look like?"
              className="w-full border border-border rounded px-3 py-2.5 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-ink block mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-border rounded px-3 py-2.5 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-ink block mb-1.5">Experience level</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
                className="w-full border border-border rounded px-3 py-2.5 text-sm bg-surface capitalize focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              >
                <option value="entry">Entry</option>
                <option value="intermediate">Intermediate</option>
                <option value="expert">Expert</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-ink block mb-1.5">Skills</label>
            <input
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder="React, TypeScript, Tailwind (comma-separated)"
              className="w-full border border-border rounded px-3 py-2.5 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
            <p className="text-xs text-muted mt-1">Separate skills with commas.</p>
          </div>

          <div>
            <label className="text-sm font-medium text-ink block mb-1.5">Job type</label>
            <div className="flex gap-3">
              {(['fixed', 'hourly'] as JobType[]).map((t) => (
                <label
                  key={t}
                  className={`flex-1 border rounded-lg px-4 py-2.5 text-sm text-center cursor-pointer transition-colors ${
                    jobType === t
                      ? 'border-primary bg-primary-light text-primary-dark font-medium'
                      : 'border-border text-ink/70 hover:border-primary/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="jobType"
                    value={t}
                    checked={jobType === t}
                    onChange={() => setJobType(t)}
                    className="sr-only"
                  />
                  {t === 'fixed' ? 'Fixed price' : 'Hourly'}
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-ink block mb-1.5">
                Min budget (${jobType === 'hourly' ? '/hr' : ''})
              </label>
              <input
                required
                type="number"
                min="1"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
                className="w-full border border-border rounded px-3 py-2.5 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink block mb-1.5">
                Max budget ($
                {jobType === 'hourly' ? '/hr' : ''})
              </label>
              <input
                required
                type="number"
                min="1"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                className="w-full border border-border rounded px-3 py-2.5 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink block mb-1.5">Deadline (days)</label>
              <input
                required
                type="number"
                min="1"
                value={deadlineDays}
                onChange={(e) => setDeadlineDays(e.target.value)}
                className="w-full border border-border rounded px-3 py-2.5 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
          </div>

          {error && (
            <div className="bg-surface border border-warn/30 text-warn rounded-lg text-sm py-3 px-4">{error}</div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-primary text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-primary-dark disabled:opacity-60 transition-colors"
            >
              {submitting ? 'Saving...' : isEditMode ? 'Save changes' : 'Post job'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/client/jobs')}
              className="text-sm text-muted hover:text-ink px-2"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
