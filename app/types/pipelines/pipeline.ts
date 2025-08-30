export type ClientStatus =
  | "sales"
  | "resume"
  | "marketing"
  | "completed"
  | "backed-out"
  | "remarketing"
  | "on-hold";

export type UserRole =
  | "admin"
  | "marketing-manager"
  | "sales-executive"
  | "resume-writer"
  | "senior-recruiter"
  | "recruiter";

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: ClientStatus;
  assignedTo: string;
  createdAt: string;
  lastUpdated: string;
  priority: "high" | "medium" | "low";
  actions: {
    [key: string]: boolean;
  };
  notes: string;
  departmentHistory?: {
    department: ClientStatus;
    startDate: string;
    endDate?: string;
  }[];
  // Enhanced action tracking
  completedActions: string[];
  currentStage: {
    department: ClientStatus;
    startDate: string;
    notes?: string;
  };
  daysInCurrentStage: number;
  // Document tracking
  documents: ClientDocument[];
  // Role-based tracking
  assignments: ClientAssignment[];
  actionHistory: ActionHistory[];
}

// Action types for the pipeline workflow
export type ActionType =
  | "Acknowledged"
  | "Initial Call Done"
  | "Resume Completed"
  | "AssignSeniorRecruiter"
  | "AssignRecruiter";

// Action completion data
export interface ActionCompletion {
  actionType: ActionType;
  department: ClientStatus;
  notes?: string;
  file?: File;
  timestamp: string;
  performedBy: string;
  role: UserRole;
}

// Client assignment tracking
export interface ClientAssignment {
  id: string;
  clientId: string;
  assignedBy: string;
  assignedTo: string;
  assignedByRole: UserRole;
  assignedToRole: UserRole;
  assignedAt: string;
  notes?: string;
}

// Action history with role information
export interface ActionHistory {
  id: string;
  clientId: string;
  actionType: ActionType;
  performedBy: string;
  performedByRole: UserRole;
  timestamp: string;
  notes?: string;
  fileUploaded?: boolean;
  fileName?: string;
}

// File upload requirements for stage transitions
export interface FileRequirement {
  action: ActionType;
  fileType: string;
  description: string;
  required: boolean;
}

// Client document tracking
export interface ClientDocument {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
  uploadedBy: string;
  fileSize: number;
  notes?: string;
}
