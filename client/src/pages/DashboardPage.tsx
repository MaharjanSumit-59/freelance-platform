import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationsContext';
import * as jobsApi from '../api/jobs';
import * as proposalsApi from '../api/proposals';
import * as contractsApi from '../api/contracts';
import * as usersApi from '../api/users';
import * as freelancersApi from '../api/freelancers';
import type { Job, Proposal, Contract, Notification, FreelancerStats } from '../types';

const ACTIVITY_ICON: Record<string, string> = {
  proposal_received: '📝',
  proposal_accepted: '✅',
  proposal_rejected: '❌',
  hired: '🎉',
  message: '💬',
  deadline: '⏰',
  review: '⭐',
};

function timeAgo(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / (1000 * 60));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function daysUntil(dateStr: string) {
  const ms = new Date(dateStr).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

function deadlineLabel(dateStr: string) {
  const days = daysUntil(dateStr);
  if (days < 0) return { text: `Overdue by ${-days}d`, urgent: true };
  if (days === 0) return { text: 'Due today', urgent: true };
  if (days <= 3) return { text: `Due in ${days}d`, urgent: true };
  return { text: `Due in ${days}d`, urgent: false };
}

function StatCard({ label, value, to }: { label: string; value: string | number; to: string }) {
  return (
    <Link
      to={to}
      className="bg-surface border border-border rounded-lg p-5 hover:border-primary hover:shadow-sm transition-all"
    >
      <p className="text-xs text-muted">{label}</p>
      <p className="text-2xl font-bold text-ink mt-1">{value}</p>
    </Link>
  );
}

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const { notifications } = useNotifications();
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [myProposals, setMyProposals] = useState<Proposal[]>([]);
  const [myContracts, setMyContracts] = useState<Contract[]>([]);
  const [freelancerStats, setFreelancerStats] = useState<FreelancerStats | null>(null);
  const [otherPartyNames, setOtherPartyNames] = useState<Record<string, string>>({});
  const [jobTitles, setJobTitles] = useState<Record<string, string>>({});

  const isClient = currentUser?.role === 'client';

  useEffect(() => {
    if (!currentUser) return;
    if (isClient) {
      jobsApi.listJobs({ clientId: currentUser.id }).then(setMyJobs);
    } else {
      proposalsApi.listMyProposals().then(setMyProposals);
      freelancersApi.getFreelancerProfile(currentUser.id).then((res) => setFreelancerStats(res.stats));
    }
    contractsApi.listMyContracts().then(setMyContracts);
  }, [currentUser, isClient]);

  // Resolve the other party's name and the job title for each contract once,
  // deduped, so the previews below don't show raw ids.
  useEffect(() => {
    if (myContracts.length === 0) return;
    const partyIds = Array.from(new Set(myContracts.map((c) => (isClient ? c.freelancerId : c.clientId))));
    Promise.all(
      partyIds.map((id) => usersApi.getPublicUser(id).then((u) => [id, u.name] as const).catch(() => [id, ''] as const))
    ).then((pairs) => setOtherPartyNames(Object.fromEntries(pairs)));

    const jobIds = Array.from(new Set(myContracts.map((c) => c.jobId)));
    Promise.all(
      jobIds.map((id) => jobsApi.getJob(id).then((j) => [id, j.title] as const).catch(() => [id, ''] as const))
    ).then((pairs) => setJobTitles(Object.fromEntries(pairs)));
  }, [myContracts, isClient]);

  if (!currentUser) return null;

  const openJobs = myJobs.filter((j) => j.status === 'open');
  const activeContracts = myContracts.filter((c) => c.status === 'in_progress');
  const pendingProposals = myProposals.filter((p) => p.status === 'pending');
  const proposalsReceived = openJobs.reduce((sum, j) => sum + j.proposalCount, 0);
  const totalSpent = myContracts.reduce(
    (sum, c) => sum + c.milestones.filter((m) => m.status === 'approved').reduce((s, m) => s + m.amount, 0),
    0
  );

  type AttentionItem = { key: string; text: string; to: string };
  const attentionItems: AttentionItem[] = [];

  if (isClient) {
    openJobs
      .filter((j) => j.proposalCount > 0)
      .slice(0, 3)
      .forEach((j) =>
        attentionItems.push({
          key: `job-${j.id}`,
          text: `${j.proposalCount} proposal${j.proposalCount > 1 ? 's' : ''} waiting on "${j.title}"`,
          to: `/client/jobs/${j.id}/proposals`,
        })
      );
    activeContracts.forEach((c) => {
      c.milestones
        .filter((m) => m.status === 'submitted')
        .forEach((m) =>
          attentionItems.push({
            key: `milestone-${m.id}`,
            text: `${otherPartyNames[c.freelancerId] || 'A freelancer'} submitted "${m.title}" for review — $${m.amount}`,
            to: '/client/contracts',
          })
        );
    });
  } else {
    activeContracts.forEach((c) => {
      const { text, urgent } = deadlineLabel(c.deadline);
      if (urgent) {
        attentionItems.push({
          key: `deadline-${c.id}`,
          text: `${jobTitles[c.jobId] || 'A contract'} — ${text.toLowerCase()}`,
          to: '/freelancer/contracts',
        });
      }
    });
  }

  const recentActivity = notifications.slice(0, 5);

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-ink">Welcome back, {currentUser.name.split(' ')[0]}</h1>
        <p className="text-sm text-muted mt-1 capitalize">{currentUser.role} account</p>

        <div className="grid sm:grid-cols-4 gap-4 mt-8">
          {isClient ? (
            <>
              <StatCard label="Open jobs" value={openJobs.length} to="/client/jobs" />
              <StatCard label="Proposals received" value={proposalsReceived} to="/client/jobs" />
              <StatCard label="Active contracts" value={activeContracts.length} to="/client/contracts" />
              <StatCard label="Total spent" value={`$${totalSpent.toLocaleString()}`} to="/client/contracts" />
            </>
          ) : (
            <>
              <StatCard label="Pending proposals" value={pendingProposals.length} to="/freelancer/proposals" />
              <StatCard label="Active contracts" value={activeContracts.length} to="/freelancer/contracts" />
              <StatCard
                label="Total earned"
                value={`$${(freelancerStats?.totalEarned ?? 0).toLocaleString()}`}
                to="/freelancer/contracts"
              />
              <StatCard
                label="Rating"
                value={freelancerStats && freelancerStats.reviewCount > 0 ? `${freelancerStats.rating.toFixed(1)} ★` : '—'}
                to={`/freelancers/${currentUser.id}`}
              />
            </>
          )}
        </div>

        {attentionItems.length > 0 && (
          <div className="mt-8">
            <h2 className="text-sm font-semibold text-ink uppercase tracking-wide mb-3">Needs your attention</h2>
            <div className="space-y-2">
              {attentionItems.slice(0, 5).map((item) => (
                <Link
                  key={item.key}
                  to={item.to}
                  className="flex items-center justify-between gap-3 bg-primary-light/40 border border-primary/20 rounded-lg px-4 py-3 text-sm hover:border-primary transition-colors"
                >
                  <span className="text-ink">{item.text}</span>
                  <span className="text-primary shrink-0">→</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8 mt-10">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-ink uppercase tracking-wide">Active contracts</h2>
              {activeContracts.length > 3 && (
                <Link
                  to={isClient ? '/client/contracts' : '/freelancer/contracts'}
                  className="text-xs text-primary hover:underline"
                >
                  View all
                </Link>
              )}
            </div>
            {activeContracts.length === 0 ? (
              <div className="bg-surface border border-border rounded-lg text-muted text-sm py-10 text-center">
                No active contracts right now.
              </div>
            ) : (
              <div className="space-y-3">
                {activeContracts.slice(0, 3).map((c) => {
                  const approved = c.milestones.filter((m) => m.status === 'approved').length;
                  const total = c.milestones.length || 1;
                  const { text: deadlineText, urgent } = deadlineLabel(c.deadline);
                  const otherName = otherPartyNames[isClient ? c.freelancerId : c.clientId];
                  return (
                    <Link
                      key={c.id}
                      to={isClient ? '/client/contracts' : '/freelancer/contracts'}
                      className="block bg-surface border border-border rounded-lg p-4 hover:border-primary transition-colors"
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <p className="text-sm font-semibold text-ink">{jobTitles[c.jobId] || '...'}</p>
                          <p className="text-xs text-muted mt-0.5">
                            {isClient ? 'Freelancer' : 'Client'}: {otherName || '...'}
                          </p>
                        </div>
                        <span className={`text-xs font-medium whitespace-nowrap ${urgent ? 'text-warn' : 'text-muted'}`}>
                          {deadlineText}
                        </span>
                      </div>
                      <div className="mt-3">
                        <div className="h-1.5 bg-bg rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${(approved / total) * 100}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted mt-1">
                          {approved}/{c.milestones.length} milestones paid &middot; ${c.agreedPrice} total
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-sm font-semibold text-ink uppercase tracking-wide mb-3">Recent activity</h2>
            {recentActivity.length === 0 ? (
              <div className="bg-surface border border-border rounded-lg text-muted text-sm py-10 text-center">
                Nothing yet — activity will show up here.
              </div>
            ) : (
              <div className="bg-surface border border-border rounded-lg divide-y divide-border/60">
                {recentActivity.map((n: Notification) => (
                  <div key={n.id} className="flex gap-2 items-start px-4 py-3">
                    <span>{ACTIVITY_ICON[n.type] ?? '🔔'}</span>
                    <div className="flex-1">
                      <p className="text-sm text-ink/90">{n.message}</p>
                      <p className="text-xs text-muted mt-0.5">{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-sm font-semibold text-ink uppercase tracking-wide mb-3">Quick links</h2>
          <div className="flex flex-wrap gap-3">
            {isClient ? (
              <>
                <Link to="/client/jobs/new" className="text-sm bg-primary text-white rounded-full px-4 py-2 hover:bg-primary-dark transition-colors">
                  Post a job
                </Link>
                <Link to="/client/jobs" className="text-sm bg-surface border border-border rounded-full px-4 py-2 hover:border-primary transition-colors">
                  Manage my jobs
                </Link>
                <Link to="/client/contracts" className="text-sm bg-surface border border-border rounded-full px-4 py-2 hover:border-primary transition-colors">
                  View contracts
                </Link>
                <Link to="/messages" className="text-sm bg-surface border border-border rounded-full px-4 py-2 hover:border-primary transition-colors">
                  Messages
                </Link>
                <Link to="/client/profile/edit" className="text-sm bg-surface border border-border rounded-full px-4 py-2 hover:border-primary transition-colors">
                  Edit my profile
                </Link>
              </>
            ) : (
              <>
                <Link to="/freelancer/profile/edit" className="text-sm bg-primary text-white rounded-full px-4 py-2 hover:bg-primary-dark transition-colors">
                  Edit my profile
                </Link>
                <Link to="/jobs" className="text-sm bg-surface border border-border rounded-full px-4 py-2 hover:border-primary transition-colors">
                  Browse jobs
                </Link>
                <Link to="/freelancer/proposals" className="text-sm bg-surface border border-border rounded-full px-4 py-2 hover:border-primary transition-colors">
                  My proposals
                </Link>
                <Link to="/freelancer/contracts" className="text-sm bg-surface border border-border rounded-full px-4 py-2 hover:border-primary transition-colors">
                  My contracts
                </Link>
                <Link to="/messages" className="text-sm bg-surface border border-border rounded-full px-4 py-2 hover:border-primary transition-colors">
                  Messages
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}