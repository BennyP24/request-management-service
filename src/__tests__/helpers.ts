import jwt from 'jsonwebtoken';
import type { TokenPayload } from '../services/authService';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export function tokenFor(role: 'requester' | 'approver', username?: string): string {
  const payload: TokenPayload = {
    userId: role === 'requester' ? '1' : '3',
    username: username ?? (role === 'requester' ? 'requester1' : 'approver1'),
    role,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

export function expiredToken(): string {
  const payload: TokenPayload = { userId: '1', username: 'requester1', role: 'requester' };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '-1s' });
}

export const requesterToken = tokenFor('requester');
export const approverToken = tokenFor('approver');
