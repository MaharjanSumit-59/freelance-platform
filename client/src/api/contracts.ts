import { apiFetch } from './client';
import { withId, withIds } from './normalize';
import type { Contract, Milestone, Message } from '../types';

interface RawMilestone extends Omit<Milestone, 'id'> {
  _id: string;
}
interface RawContract extends Omit<Contract, 'id' | 'milestones'> {
  _id: string;
  milestones: RawMilestone[];
}
interface RawMessage extends Omit<Message, 'id'> {
  _id: string;
}

function mapContract(raw: RawContract): Contract {
  const { milestones, ...rest } = withId(raw);
  return { ...rest, milestones: withIds(milestones) };
}

export async function listMyContracts(): Promise<Contract[]> {
  const res = await apiFetch<{ contracts: RawContract[] }>('/contracts/mine');
  return res.contracts.map(mapContract);
}

export async function submitMilestone(contractId: string, milestoneId: string): Promise<Contract> {
  const res = await apiFetch<{ contract: RawContract }>(
    `/contracts/${contractId}/milestones/${milestoneId}/submit`,
    { method: 'POST' }
  );
  return mapContract(res.contract);
}

export async function approveMilestone(contractId: string, milestoneId: string): Promise<Contract> {
  const res = await apiFetch<{ contract: RawContract }>(
    `/contracts/${contractId}/milestones/${milestoneId}/approve`,
    { method: 'POST' }
  );
  return mapContract(res.contract);
}

export async function completeContract(contractId: string): Promise<Contract> {
  const res = await apiFetch<{ contract: RawContract }>(`/contracts/${contractId}/complete`, {
    method: 'POST',
  });
  return mapContract(res.contract);
}

export async function listMessages(contractId: string): Promise<Message[]> {
  const res = await apiFetch<{ messages: RawMessage[] }>(`/contracts/${contractId}/messages`);
  return withIds(res.messages);
}

export async function sendMessage(contractId: string, text: string): Promise<Message> {
  const res = await apiFetch<{ message: RawMessage }>(`/contracts/${contractId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
  return withId(res.message);
}

export async function hasReviewedContract(contractId: string): Promise<boolean> {
  const res = await apiFetch<{ hasReviewed: boolean }>(`/contracts/${contractId}/reviewed`);
  return res.hasReviewed;
}
