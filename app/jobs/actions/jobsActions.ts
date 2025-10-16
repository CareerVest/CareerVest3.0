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
