import { Link } from 'react-router-dom';
import type { Job } from '../types';

function timeAgo(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return 'Posted just now';
  if (hours < 24) return `Posted ${hours}h ago`;
  return `Posted ${Math.floor(hours / 24)}d ago`;
}

export default function JobCard({ job }: { job: Job }) {
  return (
    <Link
      to={`/jobs/${job.id}`}
      className="block bg-surface border border-border rounded-lg p-5 hover:shadow-md hover:border-ink/20 transition-all"
    >
      <p className="text-xs text-muted">{timeAgo(job.createdAt)}</p>

      <h3 className="text-lg font-semibold text-ink mt-1 hover:text-primary">{job.title}</h3>

      <div className="flex items-center gap-3 text-sm text-ink mt-2">
        <span className="font-semibold">
          {job.jobType === 'fixed' ? 'Fixed price' : 'Hourly'}
        </span>
        <span className="text-border">|</span>
        <span className="capitalize">{job.experienceLevel} level</span>
        <span className="text-border">|</span>
        <span className="font-semibold">
          ${job.budgetMin}–${job.budgetMax}{job.jobType === 'hourly' ? '/hr' : ''}
        </span>
      </div>

      <p className="text-sm text-ink/70 mt-3 line-clamp-2">{job.description}</p>

      <div className="flex flex-wrap gap-2 mt-3">
        {job.skills.map((skill) => (
          <span
            key={skill}
            className="text-xs bg-bg border border-border text-ink px-3 py-1 rounded-full"
          >
            {skill}
          </span>
        ))}
      </div>

      <div className="flex justify-between items-center mt-4 pt-3 border-t border-border text-xs text-muted">
        <span>{job.proposalCount} proposals</span>
        <span className="inline-flex items-center gap-1 text-ink">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          Payment verified
        </span>
      </div>
    </Link>
  );
}
