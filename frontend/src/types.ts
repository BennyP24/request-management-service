export type RequestStatus = 'pending' | 'approved' | 'denied';
export type UserRole = 'requester' | 'approver';

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

export interface AuthUser {
  id: string;
  username: string;
  role: UserRole;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface SummaryResult {
  totalPending: number;
  summary: string;
  applications: string[];
  createdBy: string[];
}
