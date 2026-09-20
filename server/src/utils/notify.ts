import { Notification, type NotificationType } from '../models/Notification.js';
import type { Types } from 'mongoose';

export async function notify(
  userId: Types.ObjectId | string,
  type: NotificationType,
  message: string,
  relatedId?: string
) {
  await Notification.create({ userId, type, message, relatedId });
}
