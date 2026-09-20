import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import * as jobsApi from '../api/jobs';
import * as usersApi from '../api/users';
import { useAuth } from '../context/AuthContext';
import type { Proposal, Job } from '../types';

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-primary-light text-primary-dark',
  accepted: 'bg-primary text-white',
  rejected: 'bg-bg text-muted',
};

interface ProposalRow extends Proposal {
  job: Job;
  freelancerName: string;
}

export default function ClientProposalsPage() {
  const { currentUser } = useAuth();
  const [rows, setRows] = useState<ProposalRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    jobsApi
      .listJobs({ clientId: currentUser.id })
      .then(async (myJobs) => {
        const perJob = await Promise.all(
          myJobs.map(async (job) => {
            const proposals = await jobsApi.listProposalsForJob(job.id).catch(() => []);
            const withNames = await Promise.all(
              proposals.map(async (p) => {
                const freelancer = await usersApi.getPublicUser(p.freelancerId).catch(() => null);
                return { ...p, job, freelancerName: freelancer?.name ?? 'Unknown' };
              })
            );
            return withNames;
          })
        );
        const flattened = perJob
          .flat()
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setRows(flattened);
      })
      .finally(() => setLoading(false));
  }, [currentUser]);

  if (!currentUser) return null;

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-ink mb-6">All proposals</h1>

        {loading ? (
          <div className="bg-surface border border-border rounded-lg text-muted text-sm py-16 text-center">
            Loading...
          </div>
        ) : (
          <>
            {rows.length === 0 && (
              <div className="bg-surface border border-border rounded-lg text-muted text-sm py-16 text-center">
                No proposals have come in yet.
              </div>
            )}

            <div className="space-y-3">
              {rows.map((p) => (
                <Link
                  key={p.id}
                  to={`/client/jobs/${p.job.id}/proposals`}
                  className="block border border-border rounded-lg p-4 bg-surface hover:border-primary hover:shadow-sm transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-ink">{p.freelancerName}</p>
                      <p className="text-sm text-muted mt-0.5">on "{p.job.title}"</p>
                    </div>
                    <span className={`text-xs font-medium uppercase tracking-wide px-2.5 py-1 rounded-full ${STATUS_STYLE[p.status]}`}>
                      {p.status}
                    </span>
                  </div>
                  <p className="text-sm text-ink mt-2 font-semibold">${p.bidAmount}</p>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
