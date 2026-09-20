import mongoose, { Schema, type Document, type Types } from 'mongoose';

export type JobStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';
export type JobType = 'fixed' | 'hourly';
export type ExperienceLevel = 'entry' | 'intermediate' | 'expert';

export interface JobDoc extends Document {
  _id: Types.ObjectId;
  clientId: Types.ObjectId;
  title: string;
  description: string;
  category: string;
  skills: string[];
  budgetMin: number;
  budgetMax: number;
  jobType: JobType;
  experienceLevel: ExperienceLevel;
  deadlineDays: number;
  status: JobStatus;
  proposalCount: number;
  createdAt: Date;
}

const jobSchema = new Schema<JobDoc>(
  {
    clientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    skills: { type: [String], default: [] },
    budgetMin: { type: Number, required: true, min: 0 },
    budgetMax: { type: Number, required: true, min: 0 },
    jobType: { type: String, enum: ['fixed', 'hourly'], required: true },
    experienceLevel: { type: String, enum: ['entry', 'intermediate', 'expert'], required: true },
    deadlineDays: { type: Number, required: true, min: 1 },
    status: { type: String, enum: ['open', 'in_progress', 'completed', 'cancelled'], default: 'open' },
    proposalCount: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Job = mongoose.model<JobDoc>('Job', jobSchema);
