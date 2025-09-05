import axiosInstance from "../../../lib/axiosInstance";
import { useApiWithLoading } from "../../../lib/apiWithLoading";
import {
  Client,
  ClientStatus,
  UserRole,
  ActionType,
  ActionHistory,
  ClientDocument,
  ClientAssignment,
  Department,
} from "../../types/pipelines/pipeline";

// Helper function to normalize departments data (handle Entity Framework serialization)
export const normalizeDepartments = (departments: any): Department[] => {
  if (!departments) return [];

  // Handle Entity Framework serialization format
  if (
    departments &&
    typeof departments === "object" &&
    departments.$values &&
    Array.isArray(departments.$values)
  ) {
    return departments.$values;
  }

  // Handle regular array format
  if (Array.isArray(departments)) {
    return departments;
  }

  console.warn("Unexpected departments format:", departments);
  return [];
};

// Helper function to determine which assigned person to show based on stage
const getAssignedPerson = (candidate: any, status: string) => {
  // For sales and resume stages, show sales person first
  if (
    status === "sales" ||
    status === "resume" ||
    candidate.clientStatus === "In Sales"
  ) {
    return (
      candidate.assignedSalesPersonName ||
      candidate.assignedRecruiterName ||
      "Unassigned"
    );
  }
  // For marketing and other stages, show recruiter first
  return (
    candidate.assignedRecruiterName ||
    candidate.assignedSalesPersonName ||
    "Unassigned"
  );
};

// ============================================================================
// PIPELINE CANDIDATE MANAGEMENT ACTIONS
// ============================================================================

// Export the helper function for use in components
export { getAssignedPerson };

/**
 * Get all available recruiters
 */
export async function fetchRecruiters(): Promise<
  Array<{ id: number; name: string; role: string }>
> {
  try {
    console.log("🔍 Fetching available recruiters");

    // Use the working employees endpoint
    const response = await axiosInstance.get("/api/v1/employees");
    console.log("✅ Fetched employees response:", response);
    console.log("✅ Fetched employees data:", response.data);
    console.log("✅ Response status:", response.status);
    console.log("✅ Response headers:", response.headers);

    // Handle different response structures
    let employees = response.data;
    console.log("🔍 Raw employees data:", employees);
    console.log("🔍 Raw employees type:", typeof employees);

    // Check if response.data is wrapped in an object
    if (
      employees &&
      typeof employees === "object" &&
      !Array.isArray(employees)
    ) {
      console.log("🔍 Response data is an object, checking for array property");

      // Try common wrapper properties
      if (Array.isArray(employees.data)) {
        console.log("✅ Found employees in response.data.data");
        employees = employees.data;
      } else if (Array.isArray(employees.employees)) {
        console.log("✅ Found employees in response.data.employees");
        employees = employees.employees;
      } else if (Array.isArray(employees.results)) {
        console.log("✅ Found employees in response.data.results");
        employees = employees.results;
      } else if (Array.isArray(employees.items)) {
        console.log("✅ Found employees in response.data.items");
        employees = employees.items;
      } else if (Array.isArray(employees.$values)) {
        console.log("✅ Found employees in response.data.$values");
        employees = employees.$values;
      } else {
        console.log(
          "🔍 Available properties in response.data:",
          Object.keys(employees)
        );
        // If none of the common properties work, try to find any array property
        const arrayProperties = Object.keys(employees).filter((key) =>
          Array.isArray(employees[key])
        );
        if (arrayProperties.length > 0) {
          console.log("✅ Found array properties:", arrayProperties);
          employees = employees[arrayProperties[0]];
        } else {
          console.error("❌ No array property found in response.data");
          throw new Error("No array property found in employees response");
        }
      }
    }

    console.log("🔍 Processed employees data:", employees);
    console.log("🔍 Employees count:", employees?.length || 0);

    if (!Array.isArray(employees)) {
      console.error(
        "❌ Employees data is still not an array:",
        typeof employees
      );
      throw new Error("Invalid employees data format");
    }

    const recruiters = employees.filter((emp: any) => {
      console.log("🔍 Processing employee:", emp);
      const role = emp.Role?.toLowerCase() || "";
      const isRecruiter =
        role.includes("Recruiter") ||
        role.includes("Senior") ||
        role.includes("Marketing") ||
        role.includes("Manager");
      console.log(
        `🔍 Employee ${emp.FirstName} ${emp.LastName} (${role}) - isRecruiter: ${isRecruiter}`
      );
      return isRecruiter;
    });

    console.log("🔍 Filtered recruiters:", recruiters);
    console.log("🔍 Recruiters count:", recruiters.length);

    if (recruiters.length === 0) {
      console.log("⚠️ No recruiters found, using all employees");
      // If no recruiters found, use all employees
      return employees.map((emp: any) => ({
        id: emp.employeeID || emp.EmployeeID,
        name: `${emp.firstName || emp.FirstName} ${
          emp.lastName || emp.LastName
        }`.trim(),
        role: emp.role || emp.Role || "Employee",
      }));
    }

    const mappedRecruiters = recruiters.map((recruiter: any) => {
      const mapped = {
        id: recruiter.employeeID || recruiter.EmployeeID,
        name: `${recruiter.firstName || recruiter.FirstName} ${
          recruiter.lastName || recruiter.LastName
        }`.trim(),
        role: recruiter.role || recruiter.Role || "Employee",
      };
      console.log("🔍 Mapping recruiter:", { original: recruiter, mapped });
      return mapped;
    });

    console.log("🔍 Final mapped recruiters:", mappedRecruiters);
    return mappedRecruiters;
  } catch (error: any) {
    console.error("❌ Error fetching recruiters:", error);
    console.error("❌ Error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      statusText: error.response?.statusText,
    });

    // Return mock data as fallback
    const fallbackData = [
      { id: 1, name: "John Smith", role: "Senior Recruiter" },
      { id: 2, name: "Sarah Johnson", role: "Recruiter" },
      { id: 3, name: "Mike Davis", role: "Recruiter" },
      { id: 4, name: "Lisa Wilson", role: "Senior Recruiter" },
      { id: 5, name: "David Brown", role: "Recruiter" },
    ];
    console.log("⚠️ Using fallback data:", fallbackData);
    return fallbackData;
  }
}

/**
 * Update client priority
 */
// updateClientPriority removed - use executePipelineAction() instead

/**
 * Assign a recruiter to a client
 */
// assignRecruiterToClient removed - use executePipelineAction() instead

/**
 * Get all pipeline candidates with optional filtering
 */
export async function fetchPipelineCandidates(filters?: {
  status?: ClientStatus;
  assignedTo?: string;
  priority?: "high" | "medium" | "low";
  search?: string;
}): Promise<Client[]> {
  try {
    const startTime = performance.now();
    console.log("📡 Making API call to /api/v1/pipelines/candidates");

    const response = await axiosInstance.get("/api/v1/pipelines/candidates", {
      params: filters,
    });

    const apiTime = performance.now() - startTime;
    console.log(`📡 API call completed in ${apiTime.toFixed(2)}ms`);

    // Handle Entity Framework Core JSON serialization format
    let dataArray = response.data;
    if (!Array.isArray(response.data)) {
      if (
        response.data &&
        response.data.$values &&
        Array.isArray(response.data.$values)
      ) {
        dataArray = response.data.$values;
      } else if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        dataArray = response.data.data;
      } else {
        throw new Error("API response format is not as expected");
      }
    }

    // Transform backend data to frontend format
    const normalizeStatus = (
      status: string | null | undefined
    ): ClientStatus => {
      const s = (status || "").toLowerCase().trim();
      switch (s) {
        case "sales":
        case "in sales":
        case "in-sales":
          return "sales";
        case "resume":
        case "resume preparation":
        case "resume-preparation":
          return "resume";
        case "marketing":
          return "marketing";
        case "placed":
          return "placed";
        case "completed":
          return "completed";
        case "backed out":
        case "backed-out":
          return "backed-out";
        case "remarketing":
          return "remarketing";
        case "on hold":
        case "on-hold":
          return "on-hold";
        default:
          return "sales"; // safe default
      }
    };

    // Helper function to optimize priority mapping
    const normalizePriority = (priority: string | null | undefined) => {
      if (!priority) return "standard";
      const p = priority.toLowerCase();
      if (p.includes("exceptional")) return "exceptional";
      if (p.includes("real-time")) return "real-time";
      if (p.includes("fresher")) return "fresher";
      return "standard";
    };

    // Transform data in batches to prevent UI blocking
    const transformStartTime = performance.now();
    console.log(
      `🔄 Starting data transformation for ${dataArray.length} candidates`
    );

    const candidates: Client[] = [];
    const batchSize = 50; // Process 50 items at a time

    for (let i = 0; i < dataArray.length; i += batchSize) {
      const batch = dataArray.slice(i, i + batchSize);

      const transformedBatch = batch.map((candidate: any) => {
        const status = normalizeStatus(candidate.clientStatus);
        return {
          id: candidate.clientID.toString(),
          name: candidate.clientName,
          email: candidate.personalEmailAddress || "",
          phone: candidate.personalPhoneNumber || "",
          status,
          priority: normalizePriority(candidate.priority),
          assignedRecruiterID: candidate.assignedRecruiterID || null,
          assignedTo: getAssignedPerson(candidate, status),
          createdAt: candidate.enrollmentDate || new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          actions: {},
          notes: candidate.notes || "",
          departments: normalizeDepartments(candidate.departments),
          currentStage: {
            department: status,
            startDate:
              candidate.currentStageStartDate || new Date().toISOString(),
            notes: candidate.currentStageNotes || "",
          },
          daysInCurrentStage: candidate.daysInCurrentStage || 0,
        };
      });

      candidates.push(...transformedBatch);

      // Yield control back to the browser after each batch to prevent blocking
      if (i + batchSize < dataArray.length) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }

    const transformTime = performance.now() - transformStartTime;
    console.log(
      `🔄 Data transformation completed in ${transformTime.toFixed(2)}ms`
    );

    return candidates;
  } catch (error: any) {
    // Return dummy data for now to prevent frontend crashes
    return getDummyPipelineCandidates();
  }
}

/**
 * Get dummy pipeline candidates for development/testing
 */
function getDummyPipelineCandidates(): Client[] {
  // Return empty array for now to avoid type errors
  return [];
}

/**
 * Get a single pipeline candidate by ID
 */
export async function getPipelineCandidate(id: string): Promise<Client | null> {
  try {
    const response = await axiosInstance.get(
      `/api/v1/pipelines/candidates/${id}`
    );

    // Transform backend data to frontend format
    const candidate = response.data;
    const transformedCandidate: Client = {
      id: candidate.clientID.toString(),
      name: candidate.clientName,
      email: candidate.personalEmailAddress || "",
      phone: candidate.personalPhoneNumber || "",
      status: candidate.clientStatus as ClientStatus,
      priority: candidate.priority || "medium",
      assignedRecruiterID: candidate.assignedRecruiterID || null,
      assignedTo: getAssignedPerson(candidate, candidate.clientStatus),
      createdAt: candidate.enrollmentDate || new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      actions: {},
      notes: candidate.notes || "",
      departments: normalizeDepartments(candidate.departments),
      currentStage: {
        department: candidate.clientStatus as ClientStatus,
        startDate: candidate.currentStageStartDate || new Date().toISOString(),
        notes: candidate.currentStageNotes || "",
      },
      daysInCurrentStage: candidate.daysInCurrentStage || 0,
    };

    console.log("✅ Fetched pipeline candidate:", transformedCandidate.name);
    return transformedCandidate;
  } catch (error: any) {
    console.error("Error fetching pipeline candidate:", error);
    throw new Error(
      `Failed to fetch pipeline candidate: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

/**
 * Create a new pipeline candidate
 */
export async function createPipelineCandidate(
  candidateData: Omit<
    Client,
    | "id"
    | "createdAt"
    | "lastUpdated"
    | "currentStage"
    | "daysInCurrentStage"
    | "departments"
  >
): Promise<boolean> {
  try {
    // TODO: Replace with actual API call when backend is ready
    // const response = await axiosInstance.post("/api/v1/pipelines/candidates", candidateData);
    // return response.status === 200;

    // For now, just log the creation
    const newCandidate: Client = {
      ...candidateData,
      id: `candidate-${Date.now()}`,
      createdAt: new Date().toISOString().split("T")[0],
      lastUpdated: new Date().toISOString().split("T")[0],
      currentStage: {
        department: candidateData.status,
        startDate: new Date().toISOString().split("T")[0],
      },
      daysInCurrentStage: 0,
      departments: [],
    };

    console.log("✅ Pipeline candidate created:", newCandidate.name);
    return true;
  } catch (error: any) {
    console.error("Error creating pipeline candidate:", error);
    throw new Error(
      `Failed to create pipeline candidate: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

/**
 * Update an existing pipeline candidate
 */
export async function updatePipelineCandidate(
  id: string,
  updates: Partial<Client>
): Promise<boolean> {
  try {
    const response = await axiosInstance.put(
      `/api/v1/pipelines/candidates/${id}`,
      updates
    );

    console.log("✅ Pipeline candidate updated:", id);
    return response.status === 200;
  } catch (error: any) {
    console.error("Error updating pipeline candidate:", error);
    throw new Error(
      `Failed to update pipeline candidate: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

/**
 * Delete a pipeline candidate
 */
export async function deletePipelineCandidate(id: string): Promise<boolean> {
  try {
    const response = await axiosInstance.delete(
      `/api/v1/pipelines/candidates/${id}`
    );

    console.log("✅ Pipeline candidate deleted:", id);
    return response.status === 200;
  } catch (error: any) {
    console.error("Error deleting pipeline candidate:", error);
    throw new Error(
      `Failed to delete pipeline candidate: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

// ============================================================================
// PIPELINE MOVEMENT ACTIONS
// ============================================================================

// movePipelineCandidate removed - use executePipelineAction() instead

// ============================================================================
// PIPELINE ACTION MANAGEMENT ACTIONS
// ============================================================================

// completePipelineAction removed - use executePipelineAction() instead

// completeTransitionAction removed - use executePipelineAction() instead

/**
 * Get action history for a pipeline candidate
 */
export async function getPipelineActionHistory(
  candidateId: string
): Promise<ActionHistory[]> {
  try {
    const response = await axiosInstance.get(
      `/api/v1/pipelines/candidates/${candidateId}/actions`
    );

    // Transform backend data to frontend format
    const actionHistory = response.data.map((action: any) => ({
      id: action.actionHistoryID.toString(),
      clientId: action.clientID.toString(),
      actionType: action.actionType as ActionType,
      performedBy: action.performedBy,
      performedByRole: action.performedByRole as UserRole,
      timestamp: action.timestamp,
      notes: action.notes || "",
      fileUploaded: action.fileUploaded || false,
      fileName: action.fileName || "",
    }));

    console.log(
      "✅ Fetched pipeline action history for candidate:",
      candidateId
    );
    return actionHistory;
  } catch (error: any) {
    console.error("Error fetching pipeline action history:", error);
    throw new Error(
      `Failed to fetch pipeline action history: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

// ============================================================================
// PIPELINE ASSIGNMENT MANAGEMENT ACTIONS
// ============================================================================

// assignPipelineCandidate removed - use executePipelineAction() instead

/**
 * Get assignment history for a pipeline candidate
 */
export async function getPipelineAssignmentHistory(
  candidateId: string
): Promise<ClientAssignment[]> {
  try {
    const response = await axiosInstance.get(
      `/api/v1/pipelines/candidates/${candidateId}/assignments`
    );

    // Transform backend data to frontend format
    const assignments = response.data.map((assignment: any) => ({
      id: assignment.assignmentID.toString(),
      clientId: assignment.clientID.toString(),
      assignedBy: assignment.assignedBy,
      assignedTo: assignment.assignedTo,
      assignedByRole: assignment.assignedByRole as UserRole,
      assignedToRole: assignment.assignedToRole as UserRole,
      assignedAt: assignment.assignedAt,
      notes: assignment.notes || "",
    }));

    console.log(
      "✅ Fetched pipeline assignment history for candidate:",
      candidateId
    );
    return assignments;
  } catch (error: any) {
    console.error("Error fetching pipeline assignment history:", error);
    throw new Error(
      `Failed to fetch pipeline assignment history: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

// ============================================================================
// PIPELINE DOCUMENT MANAGEMENT ACTIONS
// ============================================================================

// uploadPipelineDocument removed - use executePipelineAction() instead

/**
 * Get documents for a pipeline candidate
 */
export async function getPipelineDocuments(
  candidateId: string
): Promise<ClientDocument[]> {
  try {
    const response = await axiosInstance.get(
      `/api/v1/pipelines/candidates/${candidateId}/documents`
    );

    // Transform backend data to frontend format
    const documents = response.data.map((doc: any) => ({
      id: doc.documentID.toString(),
      name: doc.name,
      type: doc.type,
      uploadedAt: doc.uploadedAt,
      uploadedBy: doc.uploadedBy,
      fileSize: doc.fileSize,
      notes: doc.notes || "",
    }));

    console.log("✅ Fetched pipeline documents for candidate:", candidateId);
    return documents;
  } catch (error: any) {
    console.error("Error fetching pipeline documents:", error);
    throw new Error(
      `Failed to fetch pipeline documents: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

/**
 * Delete a pipeline document
 */
export async function deletePipelineDocument(
  candidateId: string,
  documentId: string
): Promise<boolean> {
  try {
    const response = await axiosInstance.delete(
      `/api/v1/pipelines/documents/${documentId}`
    );

    console.log("✅ Pipeline document deleted:", {
      candidateId,
      documentId,
    });
    return response.status === 200;
  } catch (error: any) {
    console.error("Error deleting pipeline document:", error);
    throw new Error(
      `Failed to delete pipeline document: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

// ============================================================================
// PIPELINE ANALYTICS & REPORTING ACTIONS
// ============================================================================

/**
 * Get pipeline statistics
 */
export async function getPipelineStats(userRole: UserRole): Promise<{
  totalCandidates: number;
  candidatesByStage: Record<ClientStatus, number>;
  averageTimeInStage: Record<ClientStatus, number>;
  recentActivity: ActionHistory[];
}> {
  try {
    const response = await axiosInstance.get("/api/v1/pipelines/stats", {
      params: { role: userRole },
    });

    console.log("✅ Fetched pipeline stats");
    return response.data;
  } catch (error: any) {
    console.error("Error fetching pipeline stats:", error);
    throw new Error(
      `Failed to fetch pipeline statistics: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

/**
 * Get user-specific pipeline dashboard data
 */
export async function getUserPipelineDashboard(
  userRole: UserRole,
  userId: string
): Promise<{
  assignedCandidates: Client[];
  pendingActions: Array<{
    candidateId: string;
    candidateName: string;
    action: ActionType;
  }>;
  recentActivity: ActionHistory[];
}> {
  try {
    const response = await axiosInstance.get("/api/v1/pipelines/candidates", {
      params: { role: userRole },
    });

    // Transform backend data to frontend format
    const candidates = response.data.map((candidate: any) => ({
      id: candidate.clientID.toString(),
      name: candidate.clientName,
      email: candidate.personalEmailAddress || "",
      phone: candidate.personalPhoneNumber || "",
      status: candidate.clientStatus as ClientStatus,
      priority: candidate.priority || "medium",
      assignedTo: getAssignedPerson(candidate, candidate.clientStatus),
      createdAt: candidate.enrollmentDate || new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      actions: {},
      notes: candidate.notes || "",
      departments: normalizeDepartments(candidate.departments),
      currentStage: {
        department: candidate.clientStatus as ClientStatus,
        startDate: candidate.currentStageStartDate || new Date().toISOString(),
        notes: candidate.currentStageNotes || "",
      },
      daysInCurrentStage: candidate.daysInCurrentStage || 0,
    }));

    const assignedCandidates = candidates.filter(
      (candidate: Client) => candidate.assignedTo === userId
    );

    // Calculate completed actions from departments
    const getCompletedActionsCount = (departments?: Department[]) => {
      if (!departments) return 0;
      return departments.reduce((count, dept) => {
        return (
          count +
          dept.actions.filter((action) => action.status === "completed").length
        );
      }, 0);
    };

    const pendingActions = assignedCandidates
      .filter(
        (candidate: Client) =>
          getCompletedActionsCount(candidate.departments) < 3
      )
      .map((candidate: Client) => ({
        candidateId: candidate.id,
        candidateName: candidate.name,
        action: "Acknowledged" as ActionType,
      }));

    // Calculate recent activity from departments
    const recentActivity = assignedCandidates
      .flatMap((candidate: Client) => {
        if (!candidate.departments) return [];
        return candidate.departments.flatMap((dept) =>
          dept.actions.map((action) => ({
            id: `${candidate.id}-${dept.name}-${action.actionType}`,
            clientId: candidate.id,
            actionType: action.actionType as ActionType,
            performedBy: action.performedBy,
            performedByRole: action.performedByRole as UserRole,
            timestamp: action.timestamp,
            notes: action.notes,
          }))
        );
      })
      .sort(
        (a: ActionHistory, b: ActionHistory) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 5);

    console.log("✅ Fetched user pipeline dashboard for:", userId);
    return {
      assignedCandidates,
      pendingActions,
      recentActivity,
    };
  } catch (error: any) {
    console.error("Error fetching user pipeline dashboard:", error);
    throw new Error(
      `Failed to fetch user pipeline dashboard: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

// ============================================================================
// PIPELINE UTILITY ACTIONS
// ============================================================================

/**
 * Search pipeline candidates with advanced filters
 */
export async function searchPipelineCandidates(
  query: string,
  filters?: {
    status?: ClientStatus[];
    priority?: ("high" | "medium" | "low")[];
    dateRange?: { start: string; end: string };
  }
): Promise<Client[]> {
  try {
    const response = await axiosInstance.get("/api/v1/pipelines/search", {
      params: { query, ...filters },
    });

    // Transform backend data to frontend format
    const candidates: Client[] = response.data.map((candidate: any) => ({
      id: candidate.clientID.toString(),
      name: candidate.clientName,
      email: candidate.personalEmailAddress || "",
      phone: candidate.personalPhoneNumber || "",
      status: candidate.clientStatus as ClientStatus,
      priority: candidate.priority || "medium",
      assignedTo: getAssignedPerson(candidate, candidate.clientStatus),
      createdAt: candidate.enrollmentDate || new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      actions: {},
      notes: candidate.notes || "",
      departments: normalizeDepartments(candidate.departments),
      currentStage: {
        department: candidate.clientStatus as ClientStatus,
        startDate: candidate.currentStageStartDate || new Date().toISOString(),
        notes: candidate.currentStageNotes || "",
      },
      daysInCurrentStage: candidate.daysInCurrentStage || 0,
    }));

    console.log("✅ Searched pipeline candidates:", candidates.length);
    return candidates;
  } catch (error: any) {
    console.error("Error searching pipeline candidates:", error);
    throw new Error(
      `Failed to search pipeline candidates: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

// bulkUpdatePipelineCandidates removed - use executePipelineAction() for bulk operations

/**
 * Export pipeline candidate data
 */
export async function exportPipelineData(
  candidateIds: string[],
  format: "csv" | "json" | "pdf" = "json"
): Promise<string> {
  // TODO: Implement export functionality in backend
  console.warn("⚠️ Export functionality not yet implemented in backend");
  throw new Error("Export functionality not yet implemented");

  // try {
  //   const response = await axiosInstance.post(
  //     "/api/v1/pipelines/candidates/export",
  //     {
  //       candidateIds,
  //       format,
  //     }
  //   );

  //   console.log("✅ Exported pipeline data:", { candidateIds, format });
  //   return response.data;
  // } catch (error: any) {
  //   console.error("Error exporting pipeline data:", error);
  //   throw new Error(
  //     `Failed to export pipeline data: ${
  //       error.response?.data?.message || error.message
  //     }`
  //   );
  // }
}

// ============================================================================
// HOOK FOR LOADING STATE MANAGEMENT
// ============================================================================

/**
 * Get a single pipeline candidate by ID with fresh data
 */
export async function getPipelineCandidateById(id: string): Promise<Client> {
  try {
    const response = await axiosInstance.get(
      `/api/v1/pipelines/candidates/${id}`
    );

    const candidate = response.data;

    // Transform backend data to frontend format
    const transformedCandidate: Client = {
      id: candidate.clientID.toString(),
      name: candidate.clientName,
      email: candidate.personalEmailAddress || "",
      phone: candidate.personalPhoneNumber || "",
      status: candidate.clientStatus as ClientStatus,
      priority: (() => {
        const backendPriority = candidate.priority?.toLowerCase();
        if (
          backendPriority === "exceptional" ||
          backendPriority === "⭐ exceptional"
        ) {
          return "exceptional";
        } else if (
          backendPriority === "real-time" ||
          backendPriority === "⚡ real-time"
        ) {
          return "real-time";
        } else if (
          backendPriority === "fresher" ||
          backendPriority === "🌱 fresher"
        ) {
          return "fresher";
        } else if (backendPriority === "standard") {
          return "standard";
        }
        return "standard";
      })(),
      assignedRecruiterID: candidate.assignedRecruiterID || null,
      assignedTo: getAssignedPerson(candidate, candidate.clientStatus),
      createdAt: candidate.enrollmentDate || new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      actions: {},
      notes: candidate.notes || "",
      departments: normalizeDepartments(candidate.departments),
      currentStage: {
        department: candidate.clientStatus as ClientStatus,
        startDate: candidate.currentStageStartDate || new Date().toISOString(),
        notes: candidate.currentStageNotes || "",
      },
      daysInCurrentStage: candidate.daysInCurrentStage || 0,
      departmentHistory: (() => {
        // Convert stageTransitions to departmentHistory format
        const stageTransitions =
          candidate.stageTransitions?.$values ||
          candidate.stageTransitions ||
          [];
        const departmentHistory = [];

        // Add all completed stages from transitions
        stageTransitions.forEach((transition: any) => {
          departmentHistory.push({
            department: transition.fromStage,
            startDate: transition.transitionedAt,
            endDate: transition.transitionedAt, // End date is when they moved to next stage
          });
        });

        // Add current stage (the last "toStage" from transitions, or currentStageDepartment if no transitions)
        if (stageTransitions.length > 0) {
          const lastTransition = stageTransitions[stageTransitions.length - 1];
          departmentHistory.push({
            department: lastTransition.toStage,
            startDate: lastTransition.transitionedAt,
            endDate: undefined, // Current stage has no end date
          });
        } else {
          // If no transitions, use current stage
          departmentHistory.push({
            department: candidate.clientStatus,
            startDate:
              candidate.currentStageStartDate || candidate.enrollmentDate,
            endDate: undefined,
          });
        }
        return departmentHistory;
      })(),
    };

    return transformedCandidate;
  } catch (error: any) {
    throw new Error(`Failed to fetch client data: ${error.message}`);
  }
}

// ============================================================================
// RESUME CONFIRMATION ACTIONS
// ============================================================================

/**
 * Generate confirmation token for resume draft
 */
export async function generateResumeConfirmationToken(
  clientId: number,
  transitionedBy: string
): Promise<string> {
  try {
    console.log(
      "🔍 Generating resume confirmation token for client:",
      clientId
    );

    const response = await axiosInstance.post(
      `/api/resume-confirmation/generate-token`,
      {
        clientId,
        transitionedBy,
      }
    );

    console.log("✅ Resume confirmation token generated:", response.data);
    return response.data.token;
  } catch (error: any) {
    console.error("❌ Error generating resume confirmation token:", error);
    throw new Error(`Failed to generate confirmation token: ${error.message}`);
  }
}

/**
 * Get confirmation status for a client
 */
export async function getResumeConfirmationStatus(
  clientId: number
): Promise<string> {
  try {
    console.log("🔍 Getting resume confirmation status for client:", clientId);

    const response = await axiosInstance.get(
      `/api/resume-confirmation/status/${clientId}`
    );

    console.log("✅ Resume confirmation status:", response.data);
    return response.data.status;
  } catch (error: any) {
    console.error("❌ Error getting resume confirmation status:", error);
    throw new Error(`Failed to get confirmation status: ${error.message}`);
  }
}

/**
 * Update documents uploaded status
 */
export async function updateDocumentsUploadedStatus(
  clientId: number,
  transitionedBy: string,
  notes?: string
): Promise<boolean> {
  try {
    console.log("🔍 Updating documents uploaded status for client:", clientId);

    const response = await axiosInstance.post(
      `/api/resume-confirmation/documents-uploaded/${clientId}`,
      {
        transitionedBy,
        notes,
      }
    );

    console.log("✅ Documents uploaded status updated:", response.data);
    return response.data.success;
  } catch (error: any) {
    console.error("❌ Error updating documents uploaded status:", error);
    throw new Error(
      `Failed to update documents uploaded status: ${error.message}`
    );
  }
}

/**
 * Check if client is ready for marketing
 */
export async function isClientReadyForMarketing(
  clientId: number
): Promise<boolean> {
  try {
    console.log("🔍 Checking if client is ready for marketing:", clientId);

    const response = await axiosInstance.get(
      `/api/resume-confirmation/ready-for-marketing/${clientId}`
    );

    console.log("✅ Client ready for marketing status:", response.data);
    return response.data.isReady;
  } catch (error: any) {
    console.error("❌ Error checking if client is ready for marketing:", error);
    throw new Error(`Failed to check marketing readiness: ${error.message}`);
  }
}

// ============================================================================
// NEW: UNIFIED RULES-BASED ACTION SYSTEM
// ============================================================================

/**
 * Execute any pipeline action through the unified backend system
 */
export async function executePipelineAction(data: {
  clientID: number;
  actionType: string;
  notes?: string;
  priority?: string;
  assignedToID?: number;
  mainFile?: File;
  additionalFiles?: File[];
  additionalFileLabels?: string[];
  additionalData?: Record<string, any>;
}): Promise<{
  success: boolean;
  message: string;
  newStage?: string;
  stageTransitioned: boolean;
  actionCompleted?: string;
  errors?: string[];
  warnings?: string[];
}> {
  try {
    const formData = new FormData();

    // Add required fields
    formData.append("ClientID", data.clientID.toString());
    formData.append("ActionType", data.actionType);

    // Add optional fields
    if (data.notes) formData.append("Notes", data.notes);
    if (data.priority) formData.append("Priority", data.priority);
    if (data.assignedToID)
      formData.append("AssignedToID", data.assignedToID.toString());

    // Add files
    if (data.mainFile) formData.append("MainFile", data.mainFile);
    if (data.additionalFiles && data.additionalFiles.length > 0) {
      data.additionalFiles.forEach((file) => {
        formData.append("AdditionalFiles", file);
      });
    }
    if (data.additionalFileLabels && data.additionalFileLabels.length > 0) {
      data.additionalFileLabels.forEach((label) => {
        formData.append("AdditionalFileLabels", label);
      });
    }

    // Add additional data as JSON
    if (data.additionalData) {
      Object.entries(data.additionalData).forEach(([key, value]) => {
        formData.append(`AdditionalData[${key}]`, JSON.stringify(value));
      });
    }

    console.log("🔄 Executing unified pipeline action:", {
      clientID: data.clientID,
      actionType: data.actionType,
      hasMainFile: !!data.mainFile,
      additionalFilesCount: data.additionalFiles?.length || 0,
      notes: data.notes?.substring(0, 50) + "...",
    });

    const response = await axiosInstance.post(
      "/api/v1/pipelines/actions/execute",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    console.log("✅ Unified pipeline action completed:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Error executing pipeline action:", error);
    throw new Error(
      `Failed to execute pipeline action: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

/**
 * Get pipeline action rules from backend
 */
export async function getPipelineActionRules(): Promise<Record<string, any>> {
  try {
    const response = await axiosInstance.get("/api/v1/pipelines/actions/rules");
    return response.data;
  } catch (error: any) {
    console.error("❌ Error fetching pipeline rules:", error);
    throw new Error(
      `Failed to fetch pipeline rules: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

/**
 * Get available actions for a client based on backend rules
 */
export async function getAvailableActionsForClient(
  clientId: number
): Promise<string[]> {
  try {
    const response = await axiosInstance.get(
      `/api/v1/pipelines/clients/${clientId}/available-actions`
    );
    return response.data;
  } catch (error: any) {
    console.error("❌ Error fetching available actions:", error);
    throw new Error(
      `Failed to fetch available actions: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

/**
 * Get rules for a specific action and stage
 */
export async function getActionRules(
  actionType: string,
  currentStage: string
): Promise<any> {
  try {
    const response = await axiosInstance.get(
      `/api/v1/pipelines/actions/rules/${actionType}?currentStage=${currentStage}`
    );
    return response.data;
  } catch (error: any) {
    console.error("❌ Error fetching action rules:", error);
    throw new Error(
      `Failed to fetch action rules: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

/**
 * Hook to use pipeline actions with loading state
 */
export const usePipelineActions = () => {
  const { apiCall } = useApiWithLoading();

  return {
    // NEW: Unified action system
    executePipelineAction: (data: any) =>
      apiCall(executePipelineAction(data), { showLoading: true }),
    getPipelineActionRules: () =>
      apiCall(getPipelineActionRules(), { showLoading: true }),
    getAvailableActionsForClient: (clientId: number) =>
      apiCall(getAvailableActionsForClient(clientId), { showLoading: true }),
    getActionRules: (actionType: string, currentStage: string) =>
      apiCall(getActionRules(actionType, currentStage), { showLoading: true }),

    // Legacy API calls (to be gradually replaced)
    fetchPipelineCandidates: (filters?: any) =>
      apiCall(fetchPipelineCandidates(filters), { showLoading: true }),
    getPipelineCandidate: (id: string) =>
      apiCall(getPipelineCandidate(id), { showLoading: true }),
    getPipelineCandidateById: (id: string) =>
      apiCall(getPipelineCandidateById(id), { showLoading: true }),
    createPipelineCandidate: (data: any) =>
      apiCall(createPipelineCandidate(data), { showLoading: true }),
    updatePipelineCandidate: (id: string, updates: any) =>
      apiCall(updatePipelineCandidate(id, updates), { showLoading: true }),
    deletePipelineCandidate: (id: string) =>
      apiCall(deletePipelineCandidate(id), { showLoading: true }),
    // Legacy action methods removed - use executePipelineAction instead
    getPipelineActionHistory: (candidateId: string) =>
      apiCall(getPipelineActionHistory(candidateId), { showLoading: true }),
    // assignPipelineCandidate removed - use executePipelineAction instead
    getPipelineAssignmentHistory: (candidateId: string) =>
      apiCall(getPipelineAssignmentHistory(candidateId), { showLoading: true }),
    // uploadPipelineDocument removed - use executePipelineAction instead
    getPipelineDocuments: (candidateId: string) =>
      apiCall(getPipelineDocuments(candidateId), { showLoading: true }),
    deletePipelineDocument: (candidateId: string, documentId: string) =>
      apiCall(deletePipelineDocument(candidateId, documentId), {
        showLoading: true,
      }),
    getPipelineStats: (userRole: UserRole) =>
      apiCall(getPipelineStats(userRole), { showLoading: true }),
    getUserPipelineDashboard: (userRole: UserRole, userId: string) =>
      apiCall(getUserPipelineDashboard(userRole, userId), {
        showLoading: true,
      }),
    searchPipelineCandidates: (query: string, filters?: any) =>
      apiCall(searchPipelineCandidates(query, filters), { showLoading: true }),
    // bulkUpdatePipelineCandidates removed - use executePipelineAction for bulk operations
    exportPipelineData: (
      candidateIds: string[],
      format?: "csv" | "json" | "pdf"
    ) =>
      apiCall(exportPipelineData(candidateIds, format), { showLoading: true }),

    // Resume Confirmation Actions
    generateResumeConfirmationToken: (
      clientId: number,
      transitionedBy: string
    ) =>
      apiCall(generateResumeConfirmationToken(clientId, transitionedBy), {
        showLoading: true,
      }),
    getResumeConfirmationStatus: (clientId: number) =>
      apiCall(getResumeConfirmationStatus(clientId), { showLoading: true }),
    updateDocumentsUploadedStatus: (
      clientId: number,
      transitionedBy: string,
      notes?: string
    ) =>
      apiCall(updateDocumentsUploadedStatus(clientId, transitionedBy, notes), {
        showLoading: true,
      }),
    isClientReadyForMarketing: (clientId: number) =>
      apiCall(isClientReadyForMarketing(clientId), { showLoading: true }),
  };
};
