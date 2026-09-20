import { apiFetch } from './client';
import type { ClientProfile, ClientStats, User } from '../types';

export interface ClientProfileResponse {
  user: Pick<User, 'id' | 'name' | 'email' | 'createdAt'>;
  profile: ClientProfile | null;
  stats: ClientStats;
}

export async function getClientProfile(userId: string): Promise<ClientProfileResponse> {
  return apiFetch<ClientProfileResponse>(`/clients/${userId}`);
}

export async function updateClientProfile(
  userId: string,
  input: Partial<ClientProfile>
): Promise<ClientProfile> {
  const res = await apiFetch<{ profile: ClientProfile }>(`/clients/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
  return res.profile;
}


