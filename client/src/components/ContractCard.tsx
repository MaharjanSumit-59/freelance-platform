import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Contract, Job } from '../types';
import * as contractsApi from '../api/contracts';
import * as jobsApi from '../api/jobs';
import * as usersApi from '../api/users';
import { useAuth } from '../context/AuthContext';
import ReviewForm from './ReviewForm';

const STATUS_LABEL: Record<string, string> = {
  pending: 'Not started',
  submitted: 'Awaiting approval',
  approved: 'Paid',
};

export default function ContractCard({
  contract: initialContract,
  viewerRole,
}: {
  contract: Contract;
  viewerRole: 'client' | 'freelancer';
}) {
  const { currentUser } = useAuth();
  const [contract, setContract] = useState(initialContract);
  const [job, setJob] = useState<Job | null>(null);
  const [otherPartyName, setOtherPartyName] = useState<string>('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [busyMilestoneId, setBusyMilestoneId] = useState<string | null>(null);
  const [busyComplete, setBusyComplete] = useState(false);

  const otherPartyId = viewerRole === 'client' ? contract.freelancerId : contract.clientId;

  useEffect(() => {
    jobsApi.getJob(contract.jobId).then(setJob).catch(() => setJob(null));
    usersApi.getPublicUser(otherPartyId).then((u) => setOtherPartyName(u.name)).catch(() => {});
  }, [contract.jobId, otherPartyId]);

  useEffect(() => {
    if (contract.status !== 'completed') return;
    contractsApi.hasReviewedContract(contract.id).then(setAlreadyReviewed).catch(() => {});
  }, [contract.status, contract.id]);

  const paidSoFar = contract.milestones
    .filter((m) => m.status === 'approved')
    .reduce((sum, m) => sum + m.amount, 0);
  const allApproved = contract.milestones.every((m) => m.status === 'approved');

  const handleSubmitMilestone = async (milestoneId: string) => {
    setBusyMilestoneId(milestoneId);
    try {
      const updated = await contractsApi.submitMilestone(contract.id, milestoneId);
      setContract(updated);
    } finally {
      setBusyMilestoneId(null);
    }
  };

  const handleApproveMilestone = async (milestoneId: string) => {
    setBusyMilestoneId(milestoneId);
    try {
      const updated = await contractsApi.approveMilestone(contract.id, milestoneId);
      setContract(updated);
    } finally {
      setBusyMilestoneId(null);
    }
  };

  const handleComplete = async () => {
    setBusyComplete(true);
    try {
      const updated = await contractsApi.completeContract(contract.id);
      setContract(updated);
    } finally {
      setBusyComplete(false);
    }
  };

  return (
    <div className="border border-border rounded-lg p-5 bg-surface">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-lg font-semibold text-ink">{job?.title ?? '...'}</p>
          <p className="text-sm text-muted mt-1">
            {viewerRole === 'client' ? 'Freelancer' : 'Client'}:{' '}
            <Link
              to={viewerRole === 'client' ? `/freelancers/${contract.freelancerId}` : `/clients/${contract.clientId}`}
              className="hover:text-primary"
            >
              {otherPartyName || '...'}
            </Link>
          </p>
        </div>
        <span className="text-xs font-medium uppercase tracking-wide bg-primary-light text-primary-dark px-2.5 py-1 rounded-full whitespace-nowrap">
          {contract.status.replace('_', ' ')}
        </span>
      </div>

      <div className="flex gap-6 mt-3 text-sm text-muted">
        <span>Budget: <span className="text-ink font-semibold">${contract.agreedPrice}</span></span>
        <span>Paid so far: ${paidSoFar}</span>
        <span>Deadline: {new Date(contract.deadline).toLocaleDateString()}</span>
      </div>

      <Link
        to={`/messages?contract=${contract.id}`}
        className="text-xs text-primary hover:underline mt-2 inline-block"
      >
        Message {otherPartyName}
      </Link>

      <div className="mt-4 space-y-2">
        {contract.milestones.map((m) => (
          <div
            key={m.id}
            className="flex items-center gap-3 text-sm py-2 border-b border-border/60 last:border-0"
          >
            <span className={m.status === 'approved' ? 'line-through text-muted' : ''}>{m.title}</span>
            <span className="text-xs text-muted">{STATUS_LABEL[m.status]}</span>
            <span className="text-muted ml-auto mr-3">${m.amount}</span>

            {viewerRole === 'freelancer' && m.status === 'pending' && contract.status === 'in_progress' && (
              <button
                onClick={() => handleSubmitMilestone(m.id)}
                disabled={busyMilestoneId === m.id}
                className="text-xs bg-primary text-white px-3 py-1.5 rounded hover:bg-primary-dark disabled:opacity-60"
              >
                {busyMilestoneId === m.id ? 'Submitting...' : 'Submit for review'}
              </button>
            )}

            {viewerRole === 'client' && m.status === 'submitted' && contract.status === 'in_progress' && (
              <button
                onClick={() => handleApproveMilestone(m.id)}
                disabled={busyMilestoneId === m.id}
                className="text-xs bg-primary text-white px-3 py-1.5 rounded hover:bg-primary-dark disabled:opacity-60"
              >
                {busyMilestoneId === m.id ? 'Approving...' : 'Approve & pay'}
              </button>
            )}
          </div>
        ))}
      </div>

      {viewerRole === 'client' && contract.status === 'in_progress' && allApproved && (
        <button
          onClick={handleComplete}
          disabled={busyComplete}
          className="mt-4 bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-primary-dark disabled:opacity-60"
        >
          {busyComplete ? 'Completing...' : 'Mark contract complete'}
        </button>
      )}

      {contract.status === 'completed' && currentUser && (
        alreadyReviewed ? (
          <p className="text-sm text-muted mt-4">You reviewed {otherPartyName}.</p>
        ) : showReviewForm ? (
          <ReviewForm
            contractId={contract.id}
            revieweeId={otherPartyId}
            revieweeName={otherPartyName}
            onDone={() => {
              setShowReviewForm(false);
              setAlreadyReviewed(true);
            }}
          />
        ) : (
          <button
            onClick={() => setShowReviewForm(true)}
            className="mt-4 border border-primary text-primary px-4 py-2 rounded-full text-sm font-semibold hover:bg-primary hover:text-white transition-colors"
          >
            Leave a review
          </button>
        )
      )}
    </div>
  );
}
