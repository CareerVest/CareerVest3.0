export interface ClientBlockHistory {
  blockHistoryID: number;
  clientID: number;
  stageName: string;
  blockedReason: string;
  blockedDate: string;
  unblockedDate?: string | null;
  blockedBy: string;
  unblockedBy?: string | null;
  unblockComment?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface BlockClientRequest {
  stageName: string;
  blockedReason: string;
}

export interface UnblockClientRequest {
  unblockComment: string;
}

export interface BlockClientResponse {
  success: boolean;
  message: string;
  data?: ClientBlockHistory;
}

export interface ActiveBlockResponse {
  success: boolean;
  data: ClientBlockHistory | null;
  isBlocked: boolean;
}

export interface BlockHistoryResponse {
  success: boolean;
  data: ClientBlockHistory[];
  count: number;
}

// Predefined block reasons
export const BLOCK_REASONS = [
  "Client Not Responsive",
  "Payment Issue - Pending",
  "Missing Required Documents",
  "Awaiting Client Availability",
  "Technical Difficulties",
  "Client Requested Pause",
  "Awaiting Third Party",
  "Information Verification Needed",
  "Schedule Conflict",
  "Other (Specify in Comment)",
] as const;

export type BlockReason = typeof BLOCK_REASONS[number];
