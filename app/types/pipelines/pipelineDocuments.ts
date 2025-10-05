/**
 * Pipeline Document Types
 */

export interface PipelineDocument {
  documentID: number;
  clientID: number;
  name: string;
  type: string;
  fileSharePointURL: string;
  fileSize: number;
  uploadedAt: string;
  uploadedBy: string;
  notes?: string | null;

  // Associated stage/action information
  pipelineStageId?: number | null;
  stageName?: string | null;
  actionType?: string | null;
  actionLabel?: string | null;
  documentCategory?: string | null;
}

export interface ClientDocumentsResponse {
  success: boolean;
  message?: string | null;
  documents: PipelineDocument[];
  totalCount: number;
}
