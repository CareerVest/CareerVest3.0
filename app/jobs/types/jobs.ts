// Jobs Module TypeScript Interfaces

export interface Job {
  jobID: number;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  description: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  isRemote: boolean;
  jobLevel?: string; // 'Entry', 'Mid', 'Senior', 'Lead'
  jobType?: string; // 'Full-time', 'Part-time', 'Contract'
  postingDate: string; // ISO date string
  sourceURL: string;
  applicantCount?: number;
  matchScore: number; // 0-100
  freshnessStatus?: 'Live' | 'Current' | 'Week_Old' | 'Stale' | 'Expired' | 'Unknown';
}

export interface ClientWithBatch {
  clientID: number;
  clientName: string;
  clientRole: string;
  activeBatchID?: number;
  batchStatus?: 'Active' | 'Completed' | 'Paused' | 'New';
  currentProgress?: string; // "12/50 jobs"
  profilePhoto?: string;
}

export interface JobBatch {
  batchID: number;
  batchGUID: string;
  clientID: number;
  clientName: string;
  clientRole: string;
  recruiterID: number;
  totalJobs: number;
  processedJobs: number;
  appliedJobs: number;
  skippedJobs: number;
  viewedJobs: number;
  batchStatus: 'Active' | 'Completed' | 'Expired' | 'Paused';
  createdTS: string;
  expiresTS?: string;
}

export interface JobBatchItem {
  batchItemID: number;
  batchID: number;
  jobID: number;
  job: Job;
  itemOrder: number; // 1-50
  itemStatus: 'Pending' | 'Applied' | 'Skipped' | 'Viewed';
  timeSpentSeconds?: number;
}

export interface BatchStats {
  totalJobs: number;
  reviewedJobs: number;
  appliedJobs: number;
  skippedJobs: number;
  viewedJobs: number;
  progressPercentage: number;
  avgTimePerJob: number; // seconds
  avgMatchScore: number;
  applyRate: number; // percentage
  timeRemaining: string; // e.g., "6h 15m"
}

export interface ApplyJobRequest {
  batchItemID: number;
  clientID: number;
  jobID: number;
  didApply: boolean;
  comments?: string;
  timeSpentSeconds?: number;
}

export interface SkipJobRequest {
  batchItemID: number;
  clientID: number;
  jobID: number;
  skipReason: SkipReason;
  customReason?: string;
  timeSpentSeconds?: number;
}

export type SkipReason =
  | 'Already_Applied'
  | 'Not_Relevant'
  | 'Salary_Too_Low'
  | 'Location_Mismatch'
  | 'Requirements_Mismatch'
  | 'Company_Blacklist'
  | 'Description_Unclear'
  | 'Other';

export const SKIP_REASONS: { value: SkipReason; label: string }[] = [
  { value: 'Already_Applied', label: 'Already Applied (external/previously)' },
  { value: 'Not_Relevant', label: "Not Relevant to Client's Goals" },
  { value: 'Salary_Too_Low', label: 'Salary Too Low' },
  { value: 'Location_Mismatch', label: "Location Doesn't Match" },
  { value: 'Requirements_Mismatch', label: "Requirements Don't Match (missing skills)" },
  { value: 'Company_Blacklist', label: "Company on Client's Blacklist" },
  { value: 'Description_Unclear', label: 'Job Description Unclear/Incomplete' },
  { value: 'Other', label: 'Other (please specify below)' },
];
