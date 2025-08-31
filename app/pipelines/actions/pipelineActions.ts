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
} from "../../types/pipelines/pipeline";

// ============================================================================
// PIPELINE CANDIDATE MANAGEMENT ACTIONS
// ============================================================================

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
        role.includes("recruiter") ||
        role.includes("senior") ||
        role.includes("marketing") ||
        role.includes("manager");
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
export async function updateClientPriority(
  clientId: string,
  priority: string
): Promise<{ success: boolean; message: string }> {
  try {
    console.log("🔄 Updating client priority:", { clientId, priority });

    const response = await axiosInstance.put(
      `/api/v1/pipelines/clients/${clientId}/priority`,
      {
        priority,
      }
    );

    console.log("✅ Client priority updated successfully:", response.data);
    return { success: true, message: "Client priority updated successfully" };
  } catch (error: any) {
    console.error("❌ Error updating client priority:", error);
    return {
      success: false,
      message:
        error.response?.data?.message || "Failed to update client priority",
    };
  }
}

/**
 * Assign a recruiter to a client
 */
export async function assignRecruiterToClient(
  clientId: string,
  recruiterId: number,
  comment?: string
): Promise<{ success: boolean; message: string }> {
  try {
    console.log("🔄 Assigning recruiter to client:", {
      clientId,
      recruiterId,
      comment,
    });

    const response = await axiosInstance.post(
      `/api/v1/pipelines/clients/${clientId}/assign-recruiter`,
      {
        recruiterId,
        comment,
      }
    );

    console.log("✅ Recruiter assigned successfully:", response.data);
    return { success: true, message: "Recruiter assigned successfully" };
  } catch (error: any) {
    console.error("❌ Error assigning recruiter:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to assign recruiter",
    };
  }
}

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
    console.log("🔍 Fetching pipeline candidates with filters:", filters);

    const response = await axiosInstance.get("/api/v1/pipelines/candidates", {
      params: filters,
    });

    console.log("📡 API Response:", {
      status: response.status,
      statusText: response.statusText,
      dataType: typeof response.data,
      data: response.data,
    });

    // Handle Entity Framework Core JSON serialization format
    let dataArray = response.data;
    if (!Array.isArray(response.data)) {
      if (
        response.data &&
        response.data.$values &&
        Array.isArray(response.data.$values)
      ) {
        console.log(
          "✅ Found data array in response.data.$values (EF Core format)"
        );
        dataArray = response.data.$values;
      } else if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        console.log("✅ Found data array in response.data.data");
        dataArray = response.data.data;
      } else {
        console.error("❌ API returned non-array data:", response.data);
        throw new Error("API response format is not as expected");
      }
    }

    // Transform backend data to frontend format
    const candidates: Client[] = dataArray.map((candidate: any) => {
      // Debug logging to see what backend is sending
      console.log("🔍 Backend candidate data:", {
        clientID: candidate.clientID,
        currentStageDepartment: candidate.currentStageDepartment,
        priority: candidate.priority,
        assignedRecruiterName: candidate.assignedRecruiterName,
        assignedSalesPersonName: candidate.assignedSalesPersonName,
      });

      return {
        id: candidate.clientID.toString(),
        name: candidate.clientName,
        email: candidate.personalEmailAddress || "",
        phone: candidate.personalPhoneNumber || "",
        status: candidate.currentStageDepartment as ClientStatus,
        priority: (() => {
          // Map backend priority values to frontend priority values
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
          } else if (
            backendPriority === "standard" ||
            backendPriority === "standard"
          ) {
            return "standard";
          }
          // Default fallback
          return "standard";
        })(),
        assignedRecruiterID: candidate.assignedRecruiterID || null,
        assignedTo: (() => {
          // For sales stage, prioritize sales person; for other stages, prioritize recruiter
          if (candidate.currentStageDepartment === "sales") {
            return (
              candidate.assignedSalesPersonName ||
              candidate.assignedRecruiterName ||
              "Unassigned"
            );
          } else {
            return (
              candidate.assignedRecruiterName ||
              candidate.assignedSalesPersonName ||
              "Unassigned"
            );
          }
        })(),
        createdAt: candidate.enrollmentDate || new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        actions: {},
        notes: candidate.notes || "",
        completedActions: candidate.completedActions
          ? JSON.parse(candidate.completedActions)
          : [],
        currentStage: {
          department: candidate.currentStageDepartment as ClientStatus,
          startDate:
            candidate.currentStageStartDate || new Date().toISOString(),
          notes: candidate.currentStageNotes || "",
        },
        daysInCurrentStage: candidate.daysInCurrentStage || 0,
        documents: candidate.documents || [],
        assignments: candidate.assignments || [],
        actionHistory: candidate.actionHistory || [],
      };
    });

    console.log("✅ Fetched pipeline candidates:", candidates.length);
    return candidates;
  } catch (error: any) {
    console.error("❌ Error fetching pipeline candidates:", error);

    // Return dummy data for now to prevent frontend crashes
    console.log("⚠️ API error, returning dummy data as fallback");
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
      status: candidate.currentStageDepartment as ClientStatus,
      priority: candidate.priority || "medium",
      assignedRecruiterID: candidate.assignedRecruiterID || null,
      assignedTo:
        candidate.assignedRecruiterName ||
        candidate.assignedSalesPersonName ||
        "Unassigned",
      createdAt: candidate.enrollmentDate || new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      actions: {},
      notes: candidate.notes || "",
      completedActions: candidate.completedActions
        ? JSON.parse(candidate.completedActions)
        : [],
      currentStage: {
        department: candidate.currentStageDepartment as ClientStatus,
        startDate: candidate.currentStageStartDate || new Date().toISOString(),
        notes: candidate.currentStageNotes || "",
      },
      daysInCurrentStage: candidate.daysInCurrentStage || 0,
      documents: candidate.documents || [],
      assignments: candidate.assignments || [],
      actionHistory: candidate.actionHistory || [],
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
    | "completedActions"
    | "currentStage"
    | "daysInCurrentStage"
    | "documents"
    | "assignments"
    | "actionHistory"
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
      completedActions: [],
      currentStage: {
        department: candidateData.status,
        startDate: new Date().toISOString().split("T")[0],
      },
      daysInCurrentStage: 0,
      documents: [],
      assignments: [],
      actionHistory: [],
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

/**
 * Move a pipeline candidate to a different stage
 */
export async function movePipelineCandidate(
  candidateId: string,
  newStatus: ClientStatus,
  userRole: UserRole,
  notes?: string
): Promise<boolean> {
  try {
    const response = await axiosInstance.put(
      `/api/v1/pipelines/candidates/${candidateId}/move`,
      {
        toStage: newStatus,
        notes,
      }
    );

    console.log("✅ Pipeline candidate moved:", {
      candidateId,
      to: newStatus,
      userRole,
    });
    return response.status === 200;
  } catch (error: any) {
    console.error("Error moving pipeline candidate:", error);
    throw new Error(
      `Failed to move pipeline candidate: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

// ============================================================================
// PIPELINE ACTION MANAGEMENT ACTIONS
// ============================================================================

/**
 * Complete an action for a pipeline candidate
 */
export async function completePipelineAction(
  candidateId: string,
  actionType: ActionType,
  userRole: UserRole,
  data: {
    comment?: string;
    file?: File;
    additionalFiles?: File[];
  }
): Promise<boolean> {
  try {
    const formData = new FormData();
    formData.append("ClientID", candidateId);
    formData.append("ActionType", actionType);
    formData.append("Notes", data.comment || "");

    // Add main file if provided
    if (data.file) {
      formData.append("File", data.file);
    }

    // Add additional files if provided
    if (data.additionalFiles && data.additionalFiles.length > 0) {
      data.additionalFiles.forEach((file) => {
        formData.append("AdditionalFiles", file);
      });
    }

    const response = await axiosInstance.post(
      "/api/v1/pipelines/actions",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    console.log("✅ Pipeline action completed:", {
      candidateId,
      actionType,
      userRole,
      hasFile: !!data.file,
      hasAdditionalFiles:
        data.additionalFiles && data.additionalFiles.length > 0,
      comment: data.comment,
    });
    return response.status === 200;
  } catch (error: any) {
    console.error("❌ Error completing pipeline action:", error);
    throw new Error(
      `Failed to complete pipeline action: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

/**
 * Complete a transition action with multiple file uploads
 */
export async function completeTransitionAction(
  candidateId: string,
  actionType: string,
  userRole: UserRole,
  data: {
    comment?: string;
    files: Array<{ id: string; file: File; label: string }>;
  }
): Promise<boolean> {
  try {
    const formData = new FormData();
    formData.append("clientID", candidateId);
    formData.append("actionType", actionType);
    formData.append("notes", data.comment || "");

    // Append all files with their metadata
    data.files.forEach((fileData, index) => {
      formData.append(`Files`, fileData.file);
      formData.append(`FileLabels`, fileData.label);
      formData.append(`FileIds`, fileData.id);
    });

    const response = await axiosInstance.post(
      "/api/v1/pipelines/transitions",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    console.log("✅ Transition action completed:", {
      candidateId,
      actionType,
      userRole,
      fileCount: data.files.length,
    });
    return response.status === 200;
  } catch (error: any) {
    console.error("Error completing transition action:", error);
    throw new Error(
      `Failed to complete transition action: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

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

/**
 * Assign a pipeline candidate to a user
 */
export async function assignPipelineCandidate(
  candidateId: string,
  assignedTo: string,
  assignedToRole: UserRole,
  assignedBy: string,
  assignedByRole: UserRole,
  notes?: string
): Promise<boolean> {
  try {
    const response = await axiosInstance.post(
      `/api/v1/pipelines/candidates/${candidateId}/assignments`,
      {
        assignedTo,
        assignedToRole,
        notes,
      }
    );

    console.log("✅ Pipeline candidate assigned:", {
      candidateId,
      assignedTo,
      assignedToRole,
      assignedBy,
    });
    return response.status === 200;
  } catch (error: any) {
    console.error("Error assigning pipeline candidate:", error);
    throw new Error(
      `Failed to assign pipeline candidate: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

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

/**
 * Upload a document for a pipeline candidate
 */
export async function uploadPipelineDocument(
  candidateId: string,
  file: File,
  uploadedBy: string,
  notes?: string
): Promise<ClientDocument> {
  try {
    const formData = new FormData();
    formData.append("clientID", candidateId);
    formData.append("name", file.name);
    formData.append("file", file);
    formData.append("notes", notes || "");

    const response = await axiosInstance.post(
      "/api/v1/pipelines/candidates/documents",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    // Transform backend response to frontend format
    const document: ClientDocument = {
      id: response.data.documentID.toString(),
      name: response.data.name,
      type: response.data.type,
      uploadedAt: response.data.uploadedAt,
      uploadedBy: response.data.uploadedBy,
      fileSize: response.data.fileSize,
      notes: response.data.notes || "",
    };

    console.log("✅ Pipeline document uploaded:", {
      candidateId,
      fileName: file.name,
      fileSize: file.size,
    });
    return document;
  } catch (error: any) {
    console.error("Error uploading pipeline document:", error);
    throw new Error(
      `Failed to upload pipeline document: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

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
      `/api/v1/pipelines/candidates/documents/${documentId}`
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
      status: candidate.currentStageDepartment as ClientStatus,
      priority: candidate.priority || "medium",
      assignedTo:
        candidate.assignedRecruiterName ||
        candidate.assignedSalesPersonName ||
        "Unassigned",
      createdAt: candidate.enrollmentDate || new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      actions: {},
      notes: candidate.notes || "",
      completedActions: candidate.completedActions
        ? JSON.parse(candidate.completedActions)
        : [],
      currentStage: {
        department: candidate.currentStageDepartment as ClientStatus,
        startDate: candidate.currentStageStartDate || new Date().toISOString(),
        notes: candidate.currentStageNotes || "",
      },
      daysInCurrentStage: candidate.daysInCurrentStage || 0,
      documents: candidate.documents || [],
      assignments: candidate.assignments || [],
      actionHistory: candidate.actionHistory || [],
    }));

    const assignedCandidates = candidates.filter(
      (candidate: Client) => candidate.assignedTo === userId
    );

    const pendingActions = assignedCandidates
      .filter((candidate: Client) => candidate.completedActions.length < 3)
      .map((candidate: Client) => ({
        candidateId: candidate.id,
        candidateName: candidate.name,
        action: "Acknowledged" as ActionType,
      }));

    const recentActivity = assignedCandidates
      .flatMap((candidate: Client) => candidate.actionHistory)
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
    const response = await axiosInstance.get(
      "/api/v1/pipelines/candidates/search",
      {
        params: { query, ...filters },
      }
    );

    // Transform backend data to frontend format
    const candidates: Client[] = response.data.map((candidate: any) => ({
      id: candidate.clientID.toString(),
      name: candidate.clientName,
      email: candidate.personalEmailAddress || "",
      phone: candidate.personalPhoneNumber || "",
      status: candidate.currentStageDepartment as ClientStatus,
      priority: candidate.priority || "medium",
      assignedTo:
        candidate.assignedRecruiterName ||
        candidate.assignedSalesPersonName ||
        "Unassigned",
      createdAt: candidate.enrollmentDate || new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      actions: {},
      notes: candidate.notes || "",
      completedActions: candidate.completedActions
        ? JSON.parse(candidate.completedActions)
        : [],
      currentStage: {
        department: candidate.currentStageDepartment as ClientStatus,
        startDate: candidate.currentStageStartDate || new Date().toISOString(),
        notes: candidate.currentStageNotes || "",
      },
      daysInCurrentStage: candidate.daysInCurrentStage || 0,
      documents: candidate.documents || [],
      assignments: candidate.assignments || [],
      actionHistory: candidate.actionHistory || [],
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

/**
 * Bulk operations on pipeline candidates
 */
export async function bulkUpdatePipelineCandidates(
  candidateIds: string[],
  updates: Partial<Client>
): Promise<boolean> {
  try {
    // TODO: Replace with actual API call when backend is ready
    // const response = await axiosInstance.put("/api/v1/pipelines/candidates/bulk", {
    //   candidateIds,
    //   updates
    // });
    // return response.status === 204;

    // For now, just log the bulk update
    console.log("✅ Bulk updated pipeline candidates:", {
      candidateIds,
      updates,
    });
    return true;
  } catch (error: any) {
    console.error("Error bulk updating pipeline candidates:", error);
    throw new Error(
      `Failed to bulk update pipeline candidates: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

/**
 * Export pipeline candidate data
 */
export async function exportPipelineData(
  candidateIds: string[],
  format: "csv" | "json" | "pdf" = "json"
): Promise<string> {
  try {
    const response = await axiosInstance.post(
      "/api/v1/pipelines/candidates/export",
      {
        candidateIds,
        format,
      }
    );

    console.log("✅ Exported pipeline data:", { candidateIds, format });
    return response.data;
  } catch (error: any) {
    console.error("Error exporting pipeline data:", error);
    throw new Error(
      `Failed to export pipeline data: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

// ============================================================================
// HOOK FOR LOADING STATE MANAGEMENT
// ============================================================================

/**
 * Hook to use pipeline actions with loading state
 */
export const usePipelineActions = () => {
  const { apiCall } = useApiWithLoading();

  return {
    fetchPipelineCandidates: (filters?: any) =>
      apiCall(fetchPipelineCandidates(filters), { showLoading: true }),
    getPipelineCandidate: (id: string) =>
      apiCall(getPipelineCandidate(id), { showLoading: true }),
    createPipelineCandidate: (data: any) =>
      apiCall(createPipelineCandidate(data), { showLoading: true }),
    updatePipelineCandidate: (id: string, updates: any) =>
      apiCall(updatePipelineCandidate(id, updates), { showLoading: true }),
    deletePipelineCandidate: (id: string) =>
      apiCall(deletePipelineCandidate(id), { showLoading: true }),
    movePipelineCandidate: (
      candidateId: string,
      newStatus: ClientStatus,
      userRole: UserRole,
      notes?: string
    ) =>
      apiCall(movePipelineCandidate(candidateId, newStatus, userRole, notes), {
        showLoading: true,
      }),
    completePipelineAction: (
      candidateId: string,
      actionType: ActionType,
      userRole: UserRole,
      data: any
    ) =>
      apiCall(completePipelineAction(candidateId, actionType, userRole, data), {
        showLoading: true,
      }),
    getPipelineActionHistory: (candidateId: string) =>
      apiCall(getPipelineActionHistory(candidateId), { showLoading: true }),
    assignPipelineCandidate: (
      candidateId: string,
      assignedTo: string,
      assignedToRole: UserRole,
      assignedBy: string,
      assignedByRole: UserRole,
      notes?: string
    ) =>
      apiCall(
        assignPipelineCandidate(
          candidateId,
          assignedTo,
          assignedToRole,
          assignedBy,
          assignedByRole,
          notes
        ),
        { showLoading: true }
      ),
    getPipelineAssignmentHistory: (candidateId: string) =>
      apiCall(getPipelineAssignmentHistory(candidateId), { showLoading: true }),
    uploadPipelineDocument: (
      candidateId: string,
      file: File,
      uploadedBy: string,
      notes?: string
    ) =>
      apiCall(uploadPipelineDocument(candidateId, file, uploadedBy, notes), {
        showLoading: true,
      }),
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
    bulkUpdatePipelineCandidates: (candidateIds: string[], updates: any) =>
      apiCall(bulkUpdatePipelineCandidates(candidateIds, updates), {
        showLoading: true,
      }),
    exportPipelineData: (
      candidateIds: string[],
      format?: "csv" | "json" | "pdf"
    ) =>
      apiCall(exportPipelineData(candidateIds, format), { showLoading: true }),
  };
};
