import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface MessageDoc extends Document {
  _id: Types.ObjectId;
  contractId: Types.ObjectId;
  senderId: Types.ObjectId;
  text: string;
  createdAt: Date;
}

const messageSchema = new Schema<MessageDoc>(
  {
    contractId: { type: Schema.Types.ObjectId, ref: 'Contract', required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Message = mongoose.model<MessageDoc>('Message', messageSchema);
