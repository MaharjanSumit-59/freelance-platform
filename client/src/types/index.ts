export type UserRole = 'client' | 'freelancer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
}

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

export interface FreelancerStats {
  rating: number;
  reviewCount: number;
  jobsCompleted: number;
  totalEarned: number;
}

export interface ClientProfile {
  companyName: string;
  about: string;
  location: string;
}

export interface ClientStats {
  jobsPosted: number;
  contractsCompleted: number;
}

export type JobStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';
export type JobType = 'fixed' | 'hourly';
export type ExperienceLevel = 'entry' | 'intermediate' | 'expert';

export interface Job {
  id: string;
  clientId: string;
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
  createdAt: string;
  proposalCount: number;
}

export type ProposalStatus = 'pending' | 'accepted' | 'rejected';

export interface Proposal {
  id: string;
  jobId: string;
  freelancerId: string;
  coverLetter: string;
  bidAmount: number;
  estimatedDays: number;
  status: ProposalStatus;
  cvOriginalName?: string;
  createdAt: string;
}

export type ContractStatus = 'in_progress' | 'completed' | 'cancelled';
export type MilestoneStatus = 'pending' | 'submitted' | 'approved';

export interface Milestone {
  id: string;
  title: string;
  amount: number;
  status: MilestoneStatus;
}

export interface Contract {
  id: string;
  jobId: string;
  clientId: string;
  freelancerId: string;
  agreedPrice: number;
  startDate: string;
  deadline: string;
  status: ContractStatus;
  milestones: Milestone[];
}

export interface Message {
  id: string;
  contractId: string;
  senderId: string;
  text: string;
  createdAt: string;
}

export interface Review {
  id: string;
  contractId: string;
  reviewerId: string;
  revieweeId: string;
  communication: number;
  quality: number;
  timeliness: number;
  comment: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'proposal_received' | 'proposal_accepted' | 'hired' | 'message' | 'deadline' | 'review' | 'proposal_rejected';
  message: string;
  read: boolean;
  createdAt: string;
  relatedId?: string;
}