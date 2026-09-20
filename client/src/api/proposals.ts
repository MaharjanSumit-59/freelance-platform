import { apiFetch, apiFetchBlob } from './client';
import { withId, withIds } from './normalize';
import type { Proposal, Contract, Milestone } from '../types';

interface RawProposal extends Omit<Proposal, 'id'> {
  _id: string;
}
interface RawMilestone extends Omit<Milestone, 'id'> {
  _id: string;
}
interface RawContract extends Omit<Contract, 'id' | 'milestones'> {
  _id: string;
  milestones: RawMilestone[];
}

function mapContract(raw: RawContract): Contract {
  const { milestones, ...rest } = withId(raw);
  return { ...rest, milestones: withIds(milestones) };
}

export async function listMyProposals(): Promise<Proposal[]> {
  const res = await apiFetch<{ proposals: RawProposal[] }>('/proposals/mine');
  return withIds(res.proposals);
}

export async function acceptProposal(proposalId: string): Promise<{ proposal: Proposal; contract: Contract }> {
  const res = await apiFetch<{ proposal: RawProposal; contract: RawContract }>(
    `/proposals/${proposalId}/accept`,
    { method: 'POST' }
  );
  return { proposal: withId(res.proposal), contract: mapContract(res.contract) };
}

export async function rejectProposal(proposalId: string): Promise<Proposal> {
  const res = await apiFetch<{ proposal: RawProposal }>(`/proposals/${proposalId}/reject`, {
    method: 'POST',
  });
  return withId(res.proposal);
}

export async function downloadProposalCv(proposalId: string): Promise<void> {
  const { blob } = await apiFetchBlob(`/proposals/${proposalId}/cv`);
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener');
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}