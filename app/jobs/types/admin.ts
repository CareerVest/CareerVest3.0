export interface ClientConfiguration {
  configID?: number;
  clientID: number;
  clientName: string;
  clientRole: string;

  // Job Search Criteria
  keywords: string[]; // ["React", "Node.js", "TypeScript"]
  locations: string[]; // ["San Francisco", "Remote"]
  salaryMin?: number;
  salaryMax?: number;
  jobTypes: string[]; // ["Full-time", "Contract"]
  experienceLevel: string; // "Entry", "Mid", "Senior", "Mid-Senior"
  remotePreference: string; // "Remote", "Hybrid", "On-site", "Any"

  // Job Sources
  enabledSources: string[]; // ["Apify", "Indeed", "LinkedIn"]

  // Fetching Settings
  fetchFrequency: string; // "Daily", "Twice Daily", "Weekly"
  jobsPerFetch: number; // default 50
  autoCreateBatches: boolean;

  // Batch Settings
  batchSize: number; // default 50
  assignedRecruiterID?: number;
  assignedRecruiterName?: string;
  matchScoreThreshold: number; // default 70
  batchExpiryHours: number; // default 24

  // Status
  isConfigured: boolean;
  lastFetchTime?: string;
  createdTS?: string;
  updatedTS?: string;
}

export interface JobSource {
  sourceName: string; // "Apify", "Indeed API", "LinkedIn"
  isActive: boolean;
  isConfigured: boolean;
  lastRunTime?: string;
  jobsFetchedToday: number;
  jobsFetchedWeek: number;
  successRate: number; // percentage
  status: 'Running' | 'Idle' | 'Failed' | 'Not Configured';
}

export interface JobFetchRun {
  runID: number;
  clientID: number;
  clientName: string;
  sourceName: string;
  timestamp: string;
  jobsFetched: number;
  status: 'Success' | 'Failed' | 'Partial';
  errorMessage?: string;
}

export interface AdminBatch {
  batchID: number;
  batchGUID: string;
  clientID: number;
  clientName: string;
  clientRole: string;
  recruiterID: number;
  recruiterName: string;
  totalJobs: number;
  processedJobs: number;
  appliedJobs: number;
  skippedJobs: number;
  viewedJobs: number;
  batchStatus: 'Active' | 'Paused' | 'Completed' | 'Expired';
  createdTS: string;
  expiresTS: string;
  progressPercentage: number;
}

export interface AdminStats {
  totalJobsToday: number;
  totalJobsWeek: number;
  activeBatches: number;
  totalApplicationsToday: number;
  totalApplicationsWeek: number;
  successRate: number; // percentage
  apifyStatus: 'Active' | 'Idle' | 'Error';
}

export interface ClientCardData {
  clientID: number;
  clientName: string;
  clientRole: string;
  isConfigured: boolean;
  configurationStatus: 'Configured' | 'Needs Setup' | 'In Progress';
  activeBatchID?: number;
  activeBatchGUID?: string;
  batchProgress?: string; // "12/50"
  batchStatus?: 'Active' | 'Paused' | 'Completed';
  lastFetchTime?: string;
  jobsFetchedToday: number;
  applicationsToday: number;
}

export interface ApplicationAnalytics {
  date: string;
  applied: number;
  skipped: number;
  viewed: number;
}
