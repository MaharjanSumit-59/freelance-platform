import { apiFetch } from './client';
import type { User } from '../types';

export async function getPublicUser(userId: string): Promise<Pick<User, 'id' | 'name' | 'role' | 'createdAt'>> {
  const res = await apiFetch<{ user: Pick<User, 'id' | 'name' | 'role' | 'createdAt'> }>(`/users/${userId}`);
  return res.user;
}
