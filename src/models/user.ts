export type UserRole = 'requester' | 'approver';

export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
}
