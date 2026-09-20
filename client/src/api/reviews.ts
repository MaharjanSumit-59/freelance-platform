import { apiFetch } from './client';
import { withId } from './normalize';
import type { Review } from '../types';

interface RawReview extends Omit<Review, 'id'> {
  _id: string;
}

export async function createReview(input: {
  contractId: string;
  revieweeId: string;
  communication: number;
  quality: number;
  timeliness: number;
  comment: string;
}): Promise<Review> {
  const res = await apiFetch<{ review: RawReview }>('/reviews', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return withId(res.review);
}
