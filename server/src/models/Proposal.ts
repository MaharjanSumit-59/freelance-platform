import mongoose, { Schema, type Document, type Types } from 'mongoose';

export type ProposalStatus = 'pending' | 'accepted' | 'rejected';

export interface ProposalDoc extends Document {
  _id: Types.ObjectId;
  jobId: Types.ObjectId;
  freelancerId: Types.ObjectId;
  coverLetter: string;
  bidAmount: number;
  estimatedDays: number;
  status: ProposalStatus;
  cvFileName?: string;
  cvOriginalName?: string;
  createdAt: Date;
}

const proposalSchema = new Schema<ProposalDoc>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
    freelancerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    coverLetter: { type: String, required: true },
    bidAmount: { type: Number, required: true, min: 1 },
    estimatedDays: { type: Number, required: true, min: 1 },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    cvFileName: { type: String },
    cvOriginalName: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// A freelancer should only have one active proposal per job.
proposalSchema.index({ jobId: 1, freelancerId: 1 }, { unique: true });

export const Proposal = mongoose.model<ProposalDoc>('Proposal', proposalSchema);
