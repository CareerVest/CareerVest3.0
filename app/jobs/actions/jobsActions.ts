import axiosInstance from "../../../lib/axiosInstance";
import {
  Job,
  JobBatch,
  JobBatchItem,
  ClientWithBatch,
  BatchStats,
  ApplyJobRequest,
  SkipJobRequest,
} from "../types/jobs";
import {
  AdminStats,
  ClientCardData,
  AdminBatch,
  JobSource,
  ClientConfiguration,
} from "../types/admin";
import {
  ENABLE_MOCK_DATA,
  mockClients,
  mockBatch,
  mockBatchItems,
} from "../data/mockJobData";

// Helper to extract array from response (handles $values pattern)
const extractArray = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (data && data.$values) return data.$values;
  return [];
};

/**
 * ============================================================================
 * RECRUITER ENDPOINTS - Main Jobs Module
 * ============================================================================
 */

/**
 * Get all clients with their active batches for the current recruiter
 */
export async function getClientsWithBatches(): Promise<ClientWithBatch[]> {
  // Return mock data if enabled
  if (ENABLE_MOCK_DATA) {
    console.log("🎭 Using MOCK data for clients with batches");
    return Promise.resolve(mockClients);
  }

  try {
    const response = await axiosInstance.get("/api/v1/jobs/clients");
    console.log("🔹 Raw API Response (Clients with Batches):", response.data);
    const clients = extractArray(response.data);
    console.log("✅ Extracted Clients with Batches:", clients);
    return clients;
  } catch (error: any) {
    console.error("Error fetching clients with batches:", error);
    throw new Error(
      `Failed to fetch clients with batches: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

/**
 * Get current active batch for a specific client
 */
export async function getClientBatch(clientId: number): Promise<JobBatch> {
  // Return mock data if enabled
  if (ENABLE_MOCK_DATA) {
    console.log("🎭 Using MOCK data for client batch");
    return Promise.resolve(mockBatch);
  }

  try {
    const response = await axiosInstance.get(
      `/api/v1/jobs/batches/client/${clientId}`
    );
    console.log("🔹 Raw API Response (Client Batch):", response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching batch for client ${clientId}:`, error);
    throw new Error(
      `Failed to fetch client batch: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

/**
 * Get all batch items (jobs) for a specific batch
 */
export async function getBatchItems(batchId: number): Promise<JobBatchItem[]> {
  // Return mock data if enabled
  if (ENABLE_MOCK_DATA) {
    console.log("🎭 Using MOCK data for batch items");
    return Promise.resolve(mockBatchItems);
  }

  try {
    const response = await axiosInstance.get(
      `/api/v1/jobs/batches/${batchId}/items`
    );
    console.log("🔹 Raw API Response (Batch Items):", response.data);
    const items = extractArray(response.data);
    console.log("✅ Extracted Batch Items:", items);
    return items;
  } catch (error: any) {
    console.error(`Error fetching batch items for batch ${batchId}:`, error);
    throw new Error(
      `Failed to fetch batch items: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

/**
 * Record an apply or view action
 */
export async function recordApply(
  request: ApplyJobRequest
): Promise<{ success: boolean; message: string }> {
  try {
    console.log("🔹 Recording apply action:", request);
    const response = await axiosInstance.post(
      "/api/v1/jobs/actions/apply",
      request,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Apply action recorded successfully");
    return response.data;
  } catch (error: any) {
    console.error("Error recording apply action:", error);
    throw new Error(
      `Failed to record apply action: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

/**
 * Record a skip action
 */
export async function recordSkip(
  request: SkipJobRequest
): Promise<{ success: boolean; message: string }> {
  try {
    console.log("🔹 Recording skip action:", request);
    const response = await axiosInstance.post(
      "/api/v1/jobs/actions/skip",
      request,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Skip action recorded successfully");
    return response.data;
  } catch (error: any) {
    console.error("Error recording skip action:", error);
    throw new Error(
      `Failed to record skip action: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

/**
 * Update batch status (pause, complete, etc.)
 */
export async function updateBatchStatus(
  batchId: number,
  status: string
): Promise<{ success: boolean; message: string }> {
  try {
    console.log(`🔹 Updating batch ${batchId} status to: ${status}`);
    const response = await axiosInstance.put(
      `/api/v1/jobs/batches/${batchId}/status`,
      JSON.stringify(status),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Batch status updated successfully");
    return response.data;
  } catch (error: any) {
    console.error(`Error updating batch ${batchId} status:`, error);
    throw new Error(
      `Failed to update batch status: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

/**
 * ============================================================================
 * ADMIN ENDPOINTS - Jobs Admin Dashboard
 * ============================================================================
 */

/**
 * Get admin dashboard statistics
 */
export async function getAdminStats(): Promise<AdminStats> {
  try {
    const response = await axiosInstance.get("/api/v1/jobs/admin/stats");
    console.log("🔹 Raw API Response (Admin Stats):", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching admin stats:", error);
    throw new Error(
      `Failed to fetch admin stats: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

/**
 * Get all client cards for admin dashboard
 */
export async function getAdminClientCards(): Promise<ClientCardData[]> {
  try {
    const response = await axiosInstance.get("/api/v1/jobs/admin/clients");
    console.log("🔹 Raw API Response (Admin Client Cards):", response.data);
    const clients = extractArray(response.data);
    console.log("✅ Extracted Admin Client Cards:", clients);
    return clients;
  } catch (error: any) {
    console.error("Error fetching admin client cards:", error);
    throw new Error(
      `Failed to fetch admin client cards: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

/**
 * Get all active batches for admin dashboard
 */
export async function getAdminBatches(): Promise<AdminBatch[]> {
  try {
    const response = await axiosInstance.get("/api/v1/jobs/admin/batches");
    console.log("🔹 Raw API Response (Admin Batches):", response.data);
    const batches = extractArray(response.data);
    console.log("✅ Extracted Admin Batches:", batches);
    return batches;
  } catch (error: any) {
    console.error("Error fetching admin batches:", error);
    throw new Error(
      `Failed to fetch admin batches: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

/**
 * ============================================================================
 * ANALYTICS ENDPOINTS - Skip Analytics & Learning Loop
 * ============================================================================
 */

/**
 * Get system-wide skip analytics
 */
export async function getSystemSkipAnalytics(): Promise<any> {
  try {
    const response = await axiosInstance.get("/api/v1/jobs/analytics/skip/system");
    console.log("🔹 Raw API Response (System Skip Analytics):", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching system skip analytics:", error);
    throw new Error(
      `Failed to fetch system skip analytics: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

/**
 * Get client-specific skip analytics
 */
export async function getClientSkipAnalytics(clientId: number): Promise<any> {
  try {
    const response = await axiosInstance.get(
      `/api/v1/jobs/analytics/skip/client/${clientId}`
    );
    console.log("🔹 Raw API Response (Client Skip Analytics):", response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching skip analytics for client ${clientId}:`, error);
    throw new Error(
      `Failed to fetch client skip analytics: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

/**
 * Get learning loop alerts (patterns with >50% skip threshold)
 */
export async function getLearningLoopAlerts(): Promise<any[]> {
  try {
    const response = await axiosInstance.get(
      "/api/v1/jobs/analytics/learning-loop/alerts"
    );
    console.log("🔹 Raw API Response (Learning Loop Alerts):", response.data);
    const alerts = extractArray(response.data);
    console.log("✅ Extracted Learning Loop Alerts:", alerts);
    return alerts;
  } catch (error: any) {
    console.error("Error fetching learning loop alerts:", error);
    throw new Error(
      `Failed to fetch learning loop alerts: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

/**
 * ============================================================================
 * BATCH MANAGEMENT - Manual Batch Creation
 * ============================================================================
 */

/**
 * Create a batch manually for a specific client
 */
export async function createManualBatch(request: {
  clientID: number;
  batchSize: number;
}): Promise<{ success: boolean; batchID?: number; message?: string }> {
  try {
    console.log("🔹 Creating manual batch:", request);
    const response = await axiosInstance.post(
      "/api/v1/jobs/batches/create",
      request,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Manual batch created successfully");
    return response.data;
  } catch (error: any) {
    console.error("Error creating manual batch:", error);
    throw new Error(
      `Failed to create manual batch: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

/**
 * ============================================================================
 * CLIENT CONFIGURATION - CRUD Operations
 * ============================================================================
 */

/**
 * Get client job configuration by client ID
 */
export async function getClientConfiguration(clientId: number): Promise<any> {
  try {
    console.log(`🔹 Fetching configuration for client ${clientId}`);
    const response = await axiosInstance.get(
      `/api/v1/jobs/config/client/${clientId}`
    );
    console.log("✅ Configuration fetched successfully:", response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching configuration for client ${clientId}:`, error);

    // Backend returns plain string for 404, not { message: "..." }
    const errorMessage = typeof error.response?.data === 'string'
      ? error.response.data
      : error.response?.data?.message || error.message;

    throw new Error(errorMessage);
  }
}

/**
 * Get configuration by configuration ID
 */
export async function getConfigurationById(configId: number): Promise<any> {
  try {
    console.log(`🔹 Fetching configuration ${configId}`);
    const response = await axiosInstance.get(`/api/v1/jobs/config/${configId}`);
    console.log("✅ Configuration fetched successfully:", response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching configuration ${configId}:`, error);
    throw new Error(
      `Failed to fetch configuration: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

/**
 * Create new client job configuration
 */
export async function createClientConfiguration(config: any): Promise<any> {
  try {
    console.log("🔹 Creating client configuration:", config);
    const response = await axiosInstance.post("/api/v1/jobs/config", config, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("✅ Configuration created successfully:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error creating configuration:", error);
    throw new Error(
      `Failed to create configuration: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

/**
 * Update existing client job configuration
 */
export async function updateClientConfiguration(
  configId: number,
  config: any
): Promise<any> {
  try {
    console.log(`🔹 Updating configuration ${configId}:`, config);
    const response = await axiosInstance.put(
      `/api/v1/jobs/config/${configId}`,
      config,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("✅ Configuration updated successfully:", response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Error updating configuration ${configId}:`, error);
    throw new Error(
      `Failed to update configuration: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

/**
 * Delete (soft delete) client job configuration
 */
export async function deleteClientConfiguration(configId: number): Promise<any> {
  try {
    console.log(`🔹 Deleting configuration ${configId}`);
    const response = await axiosInstance.delete(`/api/v1/jobs/config/${configId}`);
    console.log("✅ Configuration deleted successfully");
    return response.data;
  } catch (error: any) {
    console.error(`Error deleting configuration ${configId}:`, error);
    throw new Error(
      `Failed to delete configuration: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

/**
 * ============================================================================
 * JOB SEARCH - On-Demand Search
 * ============================================================================
 */

/**
 * Search jobs on-demand with advanced filters
 */
export async function searchJobs(filters: {
  clientID?: number;
  title?: string;
  company?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  isRemote?: boolean;
  jobLevel?: string;
  freshnessStatus?: string;
  pageNumber: number;
  pageSize: number;
}): Promise<{ jobs: Job[]; totalCount: number; currentPage: number; totalPages: number }> {
  try {
    console.log("🔹 Searching jobs with filters:", filters);
    const response = await axiosInstance.post(
      "/api/v1/jobs/search",
      filters,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Job search completed successfully");
    const jobs = extractArray(response.data.jobs || response.data);
    return {
      jobs,
      totalCount: response.data.totalCount || jobs.length,
      currentPage: response.data.currentPage || filters.pageNumber,
      totalPages: response.data.totalPages || 1,
    };
  } catch (error: any) {
    console.error("Error searching jobs:", error);
    throw new Error(
      `Failed to search jobs: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

/**
 * ============================================================================
 * UTILITY FUNCTIONS
 * ============================================================================
 */

/**
 * Calculate batch statistics from batch data
 */
export function calculateBatchStats(batch: JobBatch): BatchStats {
  const totalJobs = batch.totalJobs;
  const reviewedJobs = batch.processedJobs;
  const appliedJobs = batch.appliedJobs;
  const skippedJobs = batch.skippedJobs;
  const viewedJobs = batch.viewedJobs || 0;

  const progressPercentage =
    totalJobs > 0 ? (reviewedJobs / totalJobs) * 100 : 0;
  const applyRate =
    reviewedJobs > 0 ? (appliedJobs / reviewedJobs) * 100 : 0;

  // Calculate average time per job (placeholder - would need actual time tracking data)
  const avgTimePerJob = 120; // Default to 2 minutes

  // Calculate average match score (placeholder - would need to fetch from batch items)
  const avgMatchScore = 85;

  // Calculate time remaining
  const timeRemaining = calculateTimeRemaining(batch.expiresTS);

  return {
    totalJobs,
    reviewedJobs,
    appliedJobs,
    skippedJobs,
    viewedJobs,
    progressPercentage,
    avgTimePerJob,
    avgMatchScore,
    applyRate,
    timeRemaining,
  };
}

/**
 * Calculate time remaining until batch expires
 */
function calculateTimeRemaining(expiresTS?: string): string {
  if (!expiresTS) return "No expiry";

  const now = new Date();
  const expiry = new Date(expiresTS);
  const diff = expiry.getTime() - now.getTime();

  if (diff <= 0) return "Expired";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }

  return `${hours}h ${minutes}m`;
}

/**
 * Get application analytics for a client (for chart display)
 */
export async function getApplicationAnalytics(clientId: number, days: number = 30): Promise<any[]> {
  try {
    const response = await axiosInstance.get(`/api/v1/jobs/admin/analytics/applications/${clientId}?days=${days}`);
    return response.data;
  } catch (error: any) {
    throw new Error(`Failed to fetch application analytics: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Get job sources status
 */
export async function getJobSources(): Promise<any[]> {
  try {
    const response = await axiosInstance.get("/api/v1/jobs/admin/sources");
    return response.data;
  } catch (error: any) {
    throw new Error(`Failed to fetch job sources: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Get fetch run history for a client
 */
export async function getFetchRuns(clientId: number): Promise<any[]> {
  try {
    const response = await axiosInstance.get(`/api/v1/jobs/admin/fetch-runs/${clientId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(`Failed to fetch run history: ${error.response?.data?.message || error.message}`);
  }
}

// ==========================================
// Job Source Fetch Settings Actions
// ==========================================

/**
 * Get all fetch source settings for a configuration
 */
export async function getConfigurationFetchSources(configId: number): Promise<any[]> {
  try {
    const response = await axiosInstance.get(`/api/v1/jobs/config/${configId}/fetch-sources`);
    return response.data;
  } catch (error: any) {
    throw new Error(`Failed to get fetch sources: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Get a specific fetch source setting by ID
 */
export async function getFetchSourceSetting(fetchSettingId: number): Promise<any> {
  try {
    const response = await axiosInstance.get(`/api/v1/jobs/config/fetch-sources/${fetchSettingId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(`Failed to get fetch source setting: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Create a new fetch source setting
 */
export async function createFetchSourceSetting(configId: number, setting: any): Promise<any> {
  try {
    const response = await axiosInstance.post(`/api/v1/jobs/config/${configId}/fetch-sources`, setting, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  } catch (error: any) {
    throw new Error(`Failed to create fetch source setting: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Update an existing fetch source setting
 */
export async function updateFetchSourceSetting(fetchSettingId: number, setting: any): Promise<any> {
  try {
    const response = await axiosInstance.put(`/api/v1/jobs/config/fetch-sources/${fetchSettingId}`, setting, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  } catch (error: any) {
    throw new Error(`Failed to update fetch source setting: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Delete a fetch source setting (soft delete)
 */
export async function deleteFetchSourceSetting(fetchSettingId: number): Promise<any> {
  try {
    const response = await axiosInstance.delete(`/api/v1/jobs/config/fetch-sources/${fetchSettingId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(`Failed to delete fetch source setting: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Get all available job sources (for dropdown/selection)
 */
export async function getAvailableJobSources(): Promise<any[]> {
  try {
    const response = await axiosInstance.get('/api/v1/jobs/sources');
    // Handle .NET JSON reference tracking format ($values wrapper)
    const data = response.data.$values || response.data;
    return Array.isArray(data) ? data : [];
  } catch (error: any) {
    throw new Error(`Failed to get available job sources: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Toggle client job configuration active status
 */
export async function toggleClientConfiguration(clientId: number): Promise<{ success: boolean; isActive: boolean; message: string }> {
  try {
    const response = await axiosInstance.patch(`/api/v1/jobs/config/${clientId}/toggle`);
    return response.data;
  } catch (error: any) {
    throw new Error(`Failed to toggle client configuration: ${error.response?.data?.message || error.message}`);
  }
}
