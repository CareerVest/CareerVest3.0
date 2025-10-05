export type ClientStatus =
  | "Sales"
  | "Resume"
  | "Marketing"
  | "Placed"
  | "BackedOut"
  | "Remarketing"
  | "OnHold";

export type UserRole =
  | "Admin"
  | "Marketing_Manager"
  | "Sales_Executive"
  | "Resume_Writer"
  | "Senior_Recruiter"
  | "Recruiter";

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: ClientStatus;
  assignedTo: string;
  assignedRecruiterID?: number | null;
  assignedRecruiterName?: string | null;
  assignedSalesPersonID?: number | null;
  assignedSalesPersonName?: string | null;
  createdAt: string;
  lastUpdated: string;
  priority: "exceptional" | "real-time" | "fresher" | "standard";
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
  completedActions?: string[];
  currentStage: {
    department: ClientStatus;
    startDate: string;
    notes?: string;
  };
  daysInCurrentStage: number;
  // Department-based action tracking
  departments?: Department[];
  // Client block status (from initial load)
  isBlocked?: boolean;
  blockedReason?: string | null;
  blockedStageName?: string | null;
}

// Action types for the pipeline workflow
export type ActionType =
  | "Acknowledged"
  | "Initial Call Done"
  | "Resume Completed"
  | "AssignSeniorRecruiter"
  | "AssignRecruiter"
  | "Acknowledged-Remarketing"
  | "RateCandidate"
  | "ChangeRecruiter"
  | "Upload Required Docs - Sales"
  | "Upload Required Docs - Resume";

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
  documentID: number;
  clientID: number;
  name: string;
  type: string;
  fileSharePointURL: string;
  fileSize: number;
  uploadedAt: string;
  uploadedBy: string;
  notes?: string;
}

// Department-based action organization
export interface Department {
  name: string;
  displayName: string;
  actions: ActionWithDocuments[];
}

export interface ActionWithDocuments {
  actionType: string;
  actionLabel: string;
  status: string;
  performedBy: string;
  performedByRole: string;
  timestamp: string;
  notes?: string;
  documents: ClientDocument[];
}
