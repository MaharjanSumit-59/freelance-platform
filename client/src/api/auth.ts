import { apiFetch, setToken } from './client';
import type { User, UserRole } from '../types';

interface AuthResponse {
  token: string;
  user: User;
}

export async function login(email: string, password: string): Promise<User> {
  const res = await apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setToken(res.token);
  return res.user;
}

export async function register(
  name: string,
  email: string,
  password: string,
  role: UserRole
): Promise<User> {
  const res = await apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, role }),
  });
  setToken(res.token);
  return res.user;
}

export async function fetchMe(): Promise<User> {
  const res = await apiFetch<{ user: User }>('/auth/me');
  return res.user;
}

export function logout() {
  setToken(null);
}
