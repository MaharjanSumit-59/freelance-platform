import { apiFetch } from './client';
import { withIds } from './normalize';
import type { FreelancerProfile, FreelancerStats, Review, User } from '../types';

interface RawReview extends Omit<Review, 'id'> {
  _id: string;
}

export interface FreelancerProfileResponse {
  user: Pick<User, 'id' | 'name' | 'email' | 'createdAt'>;
  profile: FreelancerProfile | null;
  stats: FreelancerStats;
  reviews: Review[];
}

export async function getFreelancerProfile(userId: string): Promise<FreelancerProfileResponse> {
  const res = await apiFetch<{
    user: Pick<User, 'id' | 'name' | 'email' | 'createdAt'>;
    profile: FreelancerProfile | null;
    stats: FreelancerStats;
    reviews: RawReview[];
  }>(`/freelancers/${userId}`);
  return { ...res, reviews: withIds(res.reviews) };
}

export async function updateFreelancerProfile(
  userId: string,
  input: Partial<FreelancerProfile>
): Promise<FreelancerProfile> {
  const res = await apiFetch<{ profile: FreelancerProfile }>(`/freelancers/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
  return res.profile;
}
