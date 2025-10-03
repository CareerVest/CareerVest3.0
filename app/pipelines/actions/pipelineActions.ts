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

  let deptArray: any[] = [];

  // Handle Entity Framework serialization format
  if (
    departments &&
    typeof departments === "object" &&
    departments.$values &&
    Array.isArray(departments.$values)
  ) {
    deptArray = departments.$values;
  } else if (Array.isArray(departments)) {
    deptArray = departments;
  } else {
    console.warn("Unexpected departments format:", departments);
    return [];
  }

  // Transform backend department structure to frontend format
  return deptArray.map((dept: any) => ({
    ...dept,
    department: dept.department || dept.name, // Map backend 'name' field to 'department'
    actions: Array.isArray(dept.actions) 
      ? dept.actions 
      : dept.actions?.$values || [], // Handle actions serialization
  }));
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
        case "completed":
          return "placed";
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
    console.error("Error fetching pipeline candidates:", error);
    throw new Error(
      `Failed to fetch pipeline candidates: ${
        error.response?.data?.message || error.message
      }`
    );
  }
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

    // Resume Confirmation Actions
    generateResumeConfirmationToken: (
      clientId: number,
      transitionedBy: string
    ) =>
      apiCall(generateResumeConfirmationToken(clientId, transitionedBy), {
        showLoading: true,
      }),
    getResumeConfirmationStatus: (clientId: number) =>
      apiCall(getResumeConfirmationStatus(clientId), { showLoading: true })
  };
};
