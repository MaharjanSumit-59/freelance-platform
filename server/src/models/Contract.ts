import mongoose, { Schema, type Document, type Types } from 'mongoose';

export type ContractStatus = 'in_progress' | 'completed' | 'cancelled';
export type MilestoneStatus = 'pending' | 'submitted' | 'approved';

export interface Milestone {
  _id: Types.ObjectId;
  title: string;
  amount: number;
  status: MilestoneStatus;
}

export interface ContractDoc extends Document {
  _id: Types.ObjectId;
  jobId: Types.ObjectId;
  clientId: Types.ObjectId;
  freelancerId: Types.ObjectId;
  agreedPrice: number;
  startDate: Date;
  deadline: Date;
  status: ContractStatus;
  milestones: Types.DocumentArray<Milestone>;
}

const milestoneSchema = new Schema<Milestone>({
  title: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['pending', 'submitted', 'approved'], default: 'pending' },
});

const contractSchema = new Schema<ContractDoc>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
    clientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    freelancerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    agreedPrice: { type: Number, required: true },
    startDate: { type: Date, required: true },
    deadline: { type: Date, required: true },
    status: { type: String, enum: ['in_progress', 'completed', 'cancelled'], default: 'in_progress' },
    milestones: { type: [milestoneSchema], default: [] },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Contract = mongoose.model<ContractDoc>('Contract', contractSchema);
