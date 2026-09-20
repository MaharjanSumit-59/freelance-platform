import { useParams, Link } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import MainLayout from '../layouts/MainLayout';
import * as jobsApi from '../api/jobs';
import * as proposalsApi from '../api/proposals';
import * as freelancersApi from '../api/freelancers';
import type { Job, Proposal } from '../types';
interface ProposalWithFreelancer extends Proposal {
  freelancerName: string;
  freelancerRating: number;
  freelancerJobsCompleted: number;
  freelancerHourlyRate: number;
}

export default function ClientJobProposalsPage() {
  const { jobId } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [proposals, setProposals] = useState<ProposalWithFreelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [actingOn, setActingOn] = useState<string | null>(null);
  const [cvError, setCvError] = useState('');

  const handleViewCv = async (proposalId: string) => {
    setCvError('');
    try {
      await proposalsApi.downloadProposalCv(proposalId);
    } catch {
      setCvError('Could not open this CV. Please try again.');
    }
  };

  const load = useCallback(async () => {
    if (!jobId) return;
    setLoading(true);
    setNotFound(false);
    try {
      const [jobData, proposalList] = await Promise.all([
        jobsApi.getJob(jobId),
        jobsApi.listProposalsForJob(jobId),
      ]);
      setJob(jobData);

      const enriched = await Promise.all(
        proposalList.map(async (p) => {
          const freelancer = await freelancersApi.getFreelancerProfile(p.freelancerId);
          return {
            ...p,
            freelancerName: freelancer.user.name,
            freelancerRating: freelancer.stats.rating,
            freelancerJobsCompleted: freelancer.stats.jobsCompleted,
            freelancerHourlyRate: freelancer.profile?.hourlyRate ?? 0,
          };
        })
      );
      setProposals(enriched);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAccept = async (proposalId: string) => {
    setActingOn(proposalId);
    try {
      await proposalsApi.acceptProposal(proposalId);
      await load();
    } finally {
      setActingOn(null);
    }
  };

  const handleReject = async (proposalId: string) => {
    setActingOn(proposalId);
    try {
      await proposalsApi.rejectProposal(proposalId);
      await load();
    } finally {
      setActingOn(null);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center text-muted">Loading...</div>
      </MainLayout>
    );
  }

  if (notFound || !job) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center text-muted">Job not found.</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <Link to="/client/jobs" className="text-sm text-muted hover:text-primary">&larr; My jobs</Link>
        <h1 className="text-2xl font-bold text-ink mt-4">{job.title}</h1>
        <p className="text-sm text-muted mt-1">{proposals.length} proposals</p>
        {cvError && (
          <div className="bg-surface border border-warn/30 text-warn rounded-lg text-sm py-2.5 px-4 mt-4">
            {cvError}
          </div>
        )}

        <div className="mt-6 space-y-4">
          {proposals.length === 0 && (
            <div className="bg-surface border border-border rounded-lg text-muted text-sm py-16 text-center">
              No proposals yet.
            </div>
          )}
          {proposals.map((p) => (
            <div key={p.id} className="border border-border rounded-lg p-5 bg-surface">
              <div className="flex justify-between items-start gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-primary-light text-primary-dark flex items-center justify-center text-xs font-semibold shrink-0">
                    {p.freelancerName.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div className="min-w-0">
                    <Link to={`/freelancers/${p.freelancerId}`} className="font-semibold text-ink hover:text-primary">
                      {p.freelancerName}
                    </Link>
                    <p className="text-sm text-muted mt-0.5">
                      <span className="text-star">★</span> {p.freelancerRating.toFixed(1)} &middot;{' '}
                      {p.freelancerJobsCompleted} jobs &middot; ${p.freelancerHourlyRate}/hr
                    </p>
                  </div>
                </div>
                <span className="text-xs font-medium uppercase tracking-wide bg-primary-light text-primary-dark px-2.5 py-1 rounded-full whitespace-nowrap">
                  {p.status}
                </span>
              </div>
              <p className="text-sm text-ink/80 mt-3">{p.coverLetter}</p>
              <p className="text-sm mt-3">
                Bid: <span className="text-ink font-semibold">${p.bidAmount}</span> &middot; {p.estimatedDays} days
              </p>

              {p.cvOriginalName && (
                <button
                  onClick={() => handleViewCv(p.id)}
                  className="text-sm text-primary hover:underline mt-2 flex items-center gap-1"
                >
                  📄 View CV ({p.cvOriginalName})
                </button>
              )}

              {p.status === 'pending' && (
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => handleAccept(p.id)}
                    disabled={actingOn === p.id}
                    className="bg-primary text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-primary-dark disabled:opacity-60"
                  >
                    {actingOn === p.id ? 'Working...' : 'Hire'}
                  </button>
                  <button
                    onClick={() => handleReject(p.id)}
                    disabled={actingOn === p.id}
                    className="text-sm text-muted hover:text-ink px-2 disabled:opacity-60"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}