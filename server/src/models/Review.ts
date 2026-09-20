import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface ReviewDoc extends Document {
  _id: Types.ObjectId;
  contractId: Types.ObjectId;
  reviewerId: Types.ObjectId;
  revieweeId: Types.ObjectId;
  communication: number;
  quality: number;
  timeliness: number;
  comment: string;
  createdAt: Date;
}

const reviewSchema = new Schema<ReviewDoc>(
  {
    contractId: { type: Schema.Types.ObjectId, ref: 'Contract', required: true, index: true },
    reviewerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    revieweeId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    communication: { type: Number, required: true, min: 1, max: 5 },
    quality: { type: Number, required: true, min: 1, max: 5 },
    timeliness: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// One review per (contract, reviewer) pair — you can't review the same contract twice.
reviewSchema.index({ contractId: 1, reviewerId: 1 }, { unique: true });

export const Review = mongoose.model<ReviewDoc>('Review', reviewSchema);
