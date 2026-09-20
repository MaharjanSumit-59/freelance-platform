import mongoose, { Schema, type Document, type Types } from 'mongoose';

export type NotificationType =
  | 'proposal_received'
  | 'proposal_accepted'
  | 'proposal_rejected'
  | 'hired'
  | 'message'
  | 'deadline'
  | 'review';

export interface NotificationDoc extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: NotificationType;
  message: string;
  read: boolean;
  relatedId?: string;
  createdAt: Date;
}

const notificationSchema = new Schema<NotificationDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['proposal_received', 'proposal_accepted', 'proposal_rejected' , 'hired', 'message', 'deadline', 'review'],
      required: true,
    },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    relatedId: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Notification = mongoose.model<NotificationDoc>('Notification', notificationSchema);
