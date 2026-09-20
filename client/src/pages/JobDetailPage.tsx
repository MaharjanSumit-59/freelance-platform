import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import * as jobsApi from '../api/jobs';
import * as usersApi from '../api/users';
import { useAuth } from '../context/AuthContext';
import type { Job, User } from '../types';
import { ApiError } from '../api/client';

export default function JobDetailPage() {
  const { jobId } = useParams();
  const { currentUser } = useAuth();
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [job, setJob] = useState<Job | null>(null);
  const [client, setClient] = useState<Pick<User, 'id' | 'name' | 'createdAt'> | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!jobId) return;
    setLoading(true);
    setNotFound(false);
    jobsApi
      .getJob(jobId)
      .then((j) => {
        setJob(j);
        return usersApi.getPublicUser(j.clientId);
      })
      .then(setClient)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [jobId]);

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center text-muted">Loading job...</div>
      </MainLayout>
    );
  }

  if (notFound || !job) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
          <p className="text-muted">Job not found.</p>
          <Link to="/jobs" className="text-primary underline">Back to jobs</Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-surface border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <Link to="/jobs" className="text-sm text-muted hover:text-primary">&larr; Back to jobs</Link>
          <div className="mt-3 flex flex-col-reverse items-start gap-3 sm:flex-row sm:justify-between sm:gap-6">
            <h1 className="text-xl sm:text-2xl font-bold text-ink break-words min-w-0">{job.title}</h1>
            <span className="text-xs font-medium uppercase tracking-wide bg-primary-light text-primary-dark px-2.5 py-1 rounded-full whitespace-nowrap">
              {job.status.replace('_', ' ')}
            </span>
          </div>
          <p className="text-sm text-muted mt-2">
            Posted by {client?.name} &middot; {job.proposalCount} proposals
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <div>
            <h2 className="text-sm font-semibold text-ink uppercase tracking-wide mb-3">Job description</h2>
            <p className="text-ink/80 leading-relaxed">{job.description}</p>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-ink uppercase tracking-wide mb-3">Skills and expertise</h2>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((s) => (
                <span key={s} className="text-xs bg-bg border border-border text-ink px-3 py-1.5 rounded-full">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-ink uppercase tracking-wide mb-3">About the client</h2>
            <div className="bg-surface border border-border rounded-lg p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary-light text-primary-dark flex items-center justify-center font-semibold">
                {client?.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <div>
                <Link to={`/clients/${job.clientId}`} className="font-medium text-ink hover:text-primary">
                  {client?.name}
                </Link>
                <p className="text-xs text-muted">
                  Member since {client && new Date(client.createdAt).getFullYear()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <aside className="md:col-span-1">
          <div className="bg-surface border border-border rounded-lg p-5 md:sticky md:top-20 space-y-4">
            <div>
              <p className="text-xs text-muted">{job.jobType === 'fixed' ? 'Fixed price' : 'Hourly rate'}</p>
              <p className="text-xl font-bold text-ink">
                ${job.budgetMin}–${job.budgetMax}
                {job.jobType === 'hourly' ? '/hr' : ''}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm border-t border-border pt-4">
              <div>
                <p className="text-xs text-muted">Experience</p>
                <p className="text-ink capitalize font-medium">{job.experienceLevel}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Deadline</p>
                <p className="text-ink font-medium">{job.deadlineDays} days</p>
              </div>
            </div>

            {job.status === 'open' && (
              <div className="border-t border-border pt-4">
                {!currentUser ? (
                  <p className="text-sm text-muted">
                    <Link to="/login" className="text-primary underline">
                      Log in
                    </Link>{' '}
                    as a freelancer to submit a proposal.
                  </p>
                ) : currentUser.role !== 'freelancer' ? (
                  <p className="text-sm text-muted">Only freelancers can submit proposals.</p>
                ) : !showProposalForm ? (
                  <button
                    onClick={() => setShowProposalForm(true)}
                    className="w-full bg-primary text-white py-2.5 rounded-full font-semibold text-sm hover:bg-primary-dark transition-colors"
                  >
                    Submit a proposal
                  </button>
                ) : (
                  <ProposalForm
                    jobId={job.id}
                    budgetMin={job.budgetMin}
                    budgetMax={job.budgetMax}
                    maxDeadlineDays={job.deadlineDays}
                    onCancel={() => setShowProposalForm(false)}
                  />
                )}
              </div>
            )}
          </div>
        </aside>
      </div>
    </MainLayout>
  );
}

function ProposalForm({
  jobId,
  budgetMin,
  budgetMax,
  maxDeadlineDays,
  onCancel,
}: {
  jobId: string;
  budgetMin: number;
  budgetMax: number;
  maxDeadlineDays: number;
  onCancel: () => void;
}) {
  const [coverLetter, setCoverLetter] = useState('');
  const [bid, setBid] = useState('');
  const [days, setDays] = useState('');
  const [cv, setCv] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) {
      setCv(null);
      return;
    }
    if (file.type !== 'application/pdf') {
      setError('CV must be a PDF file.');
      e.target.value = '';
      setCv(null);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('CV must be under 5MB.');
      e.target.value = '';
      setCv(null);
      return;
    }
    setError('');
    setCv(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const bidAmount = Number(bid);
    const estimatedDays = Number(days);

    if (!Number.isFinite(bidAmount) || bidAmount < budgetMin || bidAmount > budgetMax) {
      setError(`Your bid must be between $${budgetMin} and $${budgetMax} for this job.`);
      return;
    }
    if (!Number.isFinite(estimatedDays) || estimatedDays <= 0) {
      setError('Enter a valid number of days.');
      return;
    }
    if (estimatedDays > maxDeadlineDays) {
      setError(`Your timeline can't exceed the client's ${maxDeadlineDays}-day deadline.`);
      return;
    }

    setSubmitting(true);
    try {
      await jobsApi.submitProposal(jobId, { coverLetter, bidAmount, estimatedDays, cv });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not submit your proposal.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-2">
        <p className="text-primary font-semibold text-sm">Proposal sent ✓</p>
        <p className="text-xs text-muted mt-1">The client will review it and reach out if it's a fit.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="text-xs font-medium text-ink block mb-1">Cover letter</label>
        <textarea
          required
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          rows={4}
          placeholder="I have 3 years of experience building..."
          className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-ink block mb-1">
            Your bid (${budgetMin}–${budgetMax})
          </label>
          <input
            required
            type="number"
            min={budgetMin}
            max={budgetMax}
            value={bid}
            onChange={(e) => setBid(e.target.value)}
            className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-ink block mb-1">Est. days (max {maxDeadlineDays})</label>
          <input
            required
            type="number"
            min={1}
            max={maxDeadlineDays}
            value={days}
            onChange={(e) => setDays(e.target.value)}
            className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-ink block mb-1">CV (PDF, optional)</label>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleCvChange}
          className="w-full text-sm text-ink/80 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary-light file:text-primary-dark hover:file:bg-primary/20"
        />
        {cv && <p className="text-xs text-muted mt-1">{cv.name}</p>}
      </div>

      {error && <p className="text-xs text-warn">{error}</p>}

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 bg-primary text-white py-2 rounded-full text-sm font-semibold hover:bg-primary-dark disabled:opacity-60"
        >
          {submitting ? 'Sending...' : 'Send proposal'}
        </button>
        <button type="button" onClick={onCancel} className="text-sm text-muted hover:text-ink px-2">
          Cancel
        </button>
      </div>
    </form>
  );
}