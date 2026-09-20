import { apiFetch } from './client';

export interface PlatformStats {
  freelancerCount: number;
  openJobCount: number;
  contractsCompleted: number;
  jobsByCategory: Record<string, number>;
}

export async function getPlatformStats(): Promise<PlatformStats> {
  return apiFetch<PlatformStats>('/stats');
}