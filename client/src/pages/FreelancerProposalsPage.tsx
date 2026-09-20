import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import * as proposalsApi from '../api/proposals';
import * as jobsApi from '../api/jobs';
import { useAuth } from '../context/AuthContext';
import type { Proposal, Job } from '../types';

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-primary-light text-primary-dark',
  accepted: 'bg-primary text-white',
  rejected: 'bg-bg text-muted',
};

interface ProposalWithJob extends Proposal {
  job: Job | null;
}

export default function FreelancerProposalsPage() {
  const { currentUser } = useAuth();
  const [proposals, setProposals] = useState<ProposalWithJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    proposalsApi
      .listMyProposals()
      .then(async (list) => {
        const withJobs = await Promise.all(
          list.map(async (p) => {
            const job = await jobsApi.getJob(p.jobId).catch(() => null);
            return { ...p, job };
          })
        );
        setProposals(
          withJobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        );
      })
      .finally(() => setLoading(false));
  }, [currentUser]);

  if (!currentUser) return null;

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-ink mb-6">My proposals</h1>

        {loading ? (
          <div className="bg-surface border border-border rounded-lg text-muted text-sm py-16 text-center">
            Loading...
          </div>
        ) : (
          <>
            {proposals.length === 0 && (
              <div className="bg-surface border border-border rounded-lg text-muted text-sm py-16 text-center">
                You haven't submitted any proposals yet.{' '}
                <Link to="/jobs" className="text-primary hover:underline">
                  Browse open jobs
                </Link>
              </div>
            )}

            <div className="space-y-3">
              {proposals.map((p) => {
                if (!p.job) return null;
                return (
                  <Link
                    key={p.id}
                    to={`/jobs/${p.job.id}`}
                    className="block border border-border rounded-lg p-4 bg-surface hover:border-primary hover:shadow-sm transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <p className="font-medium text-ink">{p.job.title}</p>
                      <span className={`text-xs font-medium uppercase tracking-wide px-2.5 py-1 rounded-full ${STATUS_STYLE[p.status]}`}>
                        {p.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted mt-1">
                      Your bid: <span className="text-ink font-semibold">${p.bidAmount}</span> &middot; {p.estimatedDays} days
                    </p>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
