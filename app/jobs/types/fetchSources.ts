// Job Source Fetch Settings Types

export interface JobSourceFetchSetting {
  fetchSettingID: number;
  configurationID: number;
  jobSourceID: number;
  jobSourceName: string;
  isEnabled: boolean;
  maxJobsPerFetch: number;
  fetchFrequency: string; // 'Daily', 'Hourly', 'Weekly', etc.
  lastFetchTS?: string;
  nextScheduledFetchTS?: string;
  actorInputParameters?: string; // JSON string
  createdTS: string;
  updatedTS: string;
  createdBy?: string;
  updatedBy?: string;
  isActive: boolean;
}

// Base interface for actor-specific parameters
export interface ActorInputParameters {
  maxItems?: number;
  [key: string]: any; // Allow additional properties
}

// Apify Career Site Jobs Actor Parameters
export interface ApifyCareerSitesParams extends ActorInputParameters {
  urls: string[]; // Array of career site URLs
  maxItems?: number; // Max jobs to fetch (default 200)
  timeRange?: string; // Time range: '7d', '30d', '90d'
  aiEmploymentTypeFilter?: string[]; // Employment types: ['FULL_TIME', 'PART_TIME', 'CONTRACTOR', 'INTERN']
  titleExclusionSearch?: string[]; // Job titles to exclude
  proxyConfiguration?: {
    useApifyProxy: boolean;
  };
}

// LinkedIn Jobs Actor Parameters
export interface LinkedInJobsParams extends ActorInputParameters {
  keywords?: string; // Job title keywords
  location?: string; // Location filter
  datePosted?: 'pastDay' | 'pastWeek' | 'pastMonth' | 'any'; // Date filter
  experienceLevel?: string[]; // Experience levels
  jobType?: string[]; // Full-time, Part-time, etc.
  maxItems?: number; // Max jobs to fetch (default 100)
}

// Request DTO for creating/updating fetch source settings
export interface JobSourceFetchSettingRequest {
  configurationID: number;
  jobSourceID: number;
  isEnabled: boolean;
  maxJobsPerFetch: number;
  fetchFrequency: string;
  actorInputParameters?: string; // JSON string
}

// Available job sources
export interface AvailableJobSource {
  jobSourceID: number;
  sourceName: string;
  apiEndpoint?: string;
  isActive: boolean;
  description?: string;
  actorType?: 'apify-career-sites' | 'apify-linkedin' | 'indeed' | 'custom';
}
