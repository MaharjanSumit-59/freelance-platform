import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import * as jobsApi from '../api/jobs';
import { useAuth } from '../context/AuthContext';
import type { Job } from '../types';

export default function ClientJobsPage() {
  const { currentUser } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [closingId, setClosingId] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) return;
    jobsApi
      .listJobs({ clientId: currentUser.id })
      .then(setJobs)
      .finally(() => setLoading(false));
  }, [currentUser]);

  if (!currentUser) return null;

  const handleClose = async (jobId: string) => {
    if (!confirm('Close this job? It will no longer accept proposals and cannot be reopened.')) return;
    setClosingId(jobId);
    try {
      const updated = await jobsApi.closeJob(jobId);
      setJobs((prev) => prev.map((j) => (j.id === jobId ? updated : j)));
    } catch {
      alert('Could not close this job. Please try again.');
    } finally {
      setClosingId(null);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex justify-between items-center gap-3 mb-6">
          <h1 className="text-2xl font-bold text-ink">My jobs</h1>
          <Link
            to="/client/jobs/new"
            className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-primary-dark transition-colors"
          >
            Post a job
          </Link>
        </div>

        {loading ? (
          <div className="bg-surface border border-border rounded-lg text-muted text-sm py-16 text-center">
            Loading...
          </div>
        ) : (
          <>
            {jobs.length === 0 && (
              <div className="bg-surface border border-border rounded-lg text-muted text-sm py-16 text-center">
                You haven't posted any jobs yet.{' '}
                <Link to="/client/jobs/new" className="text-primary hover:underline">
                  Post your first job
                </Link>
              </div>
            )}

            <div className="space-y-3">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="border border-border rounded-lg p-5 bg-surface hover:border-primary hover:shadow-sm transition-all"
                >
                  <div className="flex justify-between items-start gap-3">
                    <p className="font-semibold text-ink min-w-0 break-words">{job.title}</p>
                    <span className="text-xs font-medium uppercase tracking-wide bg-primary-light text-primary-dark px-2.5 py-1 rounded-full shrink-0">
                      {job.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-muted mt-1">{job.proposalCount} proposals</p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm">
                    <Link to={`/client/jobs/${job.id}/proposals`} className="text-primary hover:underline">
                      View proposals →
                    </Link>
                    {job.status === 'open' && (
                      <>
                        <Link to={`/client/jobs/${job.id}/edit`} className="text-muted hover:text-ink">
                          Edit
                        </Link>
                        <button
                          onClick={() => handleClose(job.id)}
                          disabled={closingId === job.id}
                          className="text-warn hover:underline disabled:opacity-60"
                        >
                          {closingId === job.id ? 'Closing...' : 'Close'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
