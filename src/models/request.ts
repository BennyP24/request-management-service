export type RequestStatus = 'pending' | 'approved' | 'denied';

export interface AccessRequest {
  id: string;
  application: string;
  status: RequestStatus;
  requesterId: string;
  createdBy: string;
  createdAt: string;
  decisionBy: string | null;
  decisionAt: string | null;
}

export interface CreateRequestInput {
  application: string;
}
