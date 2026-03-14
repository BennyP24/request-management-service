export type RequestStatus = 'pending' | 'approved' | 'denied';

export interface AccessRequest {
  id: string;
  application: string;
  status: RequestStatus;
  createdBy: string;
  createdAt: string;
  decisionBy: string | null;
  decisionAt: string | null;
}

export interface CreateRequestInput {
  application: string;
  createdBy: string;
}

export interface SummaryResult {
  totalPending: number;
  summary: string;
  applications: string[];
  createdBy: string[];
}
