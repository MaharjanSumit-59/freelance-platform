import mongoose, { Schema, type Document, type Types } from 'mongoose';

export type UserRole = 'client' | 'freelancer' | 'admin';

export interface PortfolioItem {
  title: string;
  imageUrl?: string;
  description: string;
}

export interface FreelancerProfile {
  title: string;
  about: string;
  hourlyRate: number;
  skills: string[];
  portfolio: PortfolioItem[];
}

export interface ClientProfile {
  companyName: string;
  about: string;
  location: string;
}

export interface UserDoc extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  freelancerProfile?: FreelancerProfile;
  clientProfile?: ClientProfile;
  createdAt: Date;
}

const portfolioItemSchema = new Schema<PortfolioItem>(
  {
    title: { type: String, required: true },
    imageUrl: { type: String, default: '' },
    description: { type: String, default: '' },
  },
  { _id: false }
);

const freelancerProfileSchema = new Schema<FreelancerProfile>(
  {
    title: { type: String, default: '' },
    about: { type: String, default: '' },
    hourlyRate: { type: Number, default: 0 },
    skills: { type: [String], default: [] },
    portfolio: { type: [portfolioItemSchema], default: [] },
  },
  { _id: false }
);

const clientProfileSchema = new Schema<ClientProfile>(
  {
    companyName: { type: String, default: '' },
    about: { type: String, default: '' },
    location: { type: String, default: '' },
  },
  { _id: false }
);

const userSchema = new Schema<UserDoc>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['client', 'freelancer', 'admin'], required: true },
    freelancerProfile: { type: freelancerProfileSchema, default: undefined },
    clientProfile: { type: clientProfileSchema, default: undefined },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const User = mongoose.model<UserDoc>('User', userSchema);
