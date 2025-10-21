/**
 * Recruiter Assignment History Types
 * Tracks when recruiters are assigned/changed for clients
 * Matches RecruiterAssignmentHistory model from backend
 */

export interface RecruiterAssignmentHistory {
  assignmentHistoryID: number;
  clientID: number;
  previousRecruiterID: number | null;
  newRecruiterID: number;
  previousRecruiterName: string | null;
  newRecruiterName: string;
  stageName: string; // marketing/remarketing
  eventType: "initial_assignment" | "recruiter_change";
  assignedBy: string; // User who made the assignment
  assignedByRole: string; // Marketing_Manager/Admin
  assignedDate: string; // ISO datetime
  unassignedDate: string | null; // When assignment ended
  durationInBusinessDays: number | null; // How long previous recruiter worked
  isActive: boolean; // Is this the current assignment?
  notes: string | null;
  metadata: string | null; // JSON string
  createdAt: string;
  updatedAt: string | null;
}

export interface RecruiterHistoryMetadata {
  previousRecruiterID: number | null;
  newRecruiterID: number;
  stageName: string;
  actionType: string;
  assignedByID: number;
  assignedByRole: string;
}

export interface RecruiterHistoryResponse {
  success: boolean;
  data: RecruiterAssignmentHistory[];
  count: number;
}

export interface ActiveRecruiterResponse {
  success: boolean;
  data: RecruiterAssignmentHistory | null;
  message?: string;
}

export interface RecruiterTenureDaysResponse {
  success: boolean;
  durationInBusinessDays: number;
}

export interface LastRecruiterChangeResponse {
  success: boolean;
  data: RecruiterAssignmentHistory | null;
  message?: string;
}

export interface RecruiterAssignmentCountResponse {
  success: boolean;
  count: number;
}

export interface AllAssignedRecruitersResponse {
  success: boolean;
  data: number[]; // Recruiter IDs
  count: number;
}
