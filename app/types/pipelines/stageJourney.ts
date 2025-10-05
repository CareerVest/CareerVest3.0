export interface ActionInfo {
  actionType: string;
  actionLabel: string;
  isCompleted: boolean;
  timestamp: string;
  performedBy: string | null;
  notes: string | null;
}

export interface StageVisit {
  visitNumber: number;
  stageName: string;
  stageDisplayName: string;
  startDate: string;
  endDate: string | null;
  durationDays: number;
  durationBusinessDays: number;
  assignedPersonName: string | null;
  assignedPersonRole: string | null;
  actionsCompleted: number;
  totalActions: number;
  actions: ActionInfo[];
  endedReason: string | null;
  transitionedBy: string | null;
  notes?: string | null;
  isCurrentStage: boolean;
}

export interface ClientMinimalInfo {
  clientID: number;
  clientName: string;
  personalEmailAddress: string;
  clientStatus: string;
  priority: string;
  assignedRecruiterName: string | null;
  assignedSalesPersonName: string | null;
  isBlocked: boolean;
  blockedDaysInCurrentStage: number;
}

export interface StageJourneyResponse {
  success: boolean;
  client: ClientMinimalInfo | null;
  data: StageVisit[];
  totalVisits: number;
  totalDays: number;
  totalBusinessDays: number;
  message?: string;
}
