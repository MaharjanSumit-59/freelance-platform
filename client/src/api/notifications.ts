import { apiFetch } from './client';
import { withIds } from './normalize';
import type { Notification } from '../types';

interface RawNotification extends Omit<Notification, 'id'> {
  _id: string;
}

export async function listMyNotifications(): Promise<Notification[]> {
  const res = await apiFetch<{ notifications: RawNotification[] }>('/notifications/mine');
  return withIds(res.notifications);
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  await apiFetch(`/notifications/${notificationId}/read`, { method: 'POST' });
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiFetch('/notifications/read-all', { method: 'POST' });
}
