import jwt from 'jsonwebtoken';
import { UserRole } from '../models/user';
import * as userStore from '../storage/userStore';
import { AppError } from '../middleware';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_EXPIRY = '1h';

export interface TokenPayload {
  userId: string;
  username: string;
  role: UserRole;
}

export function login(username: string, password: string): { token: string; user: { id: string; username: string; role: UserRole } } {
  const user = userStore.findByUsername(username);
  if (!user || user.password !== password) {
    throw new AppError(401, 'Invalid credentials');
  }

  const payload: TokenPayload = { userId: user.id, username: user.username, role: user.role };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });

  return { token, user: { id: user.id, username: user.username, role: user.role } };
}

export function verifyToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (err) {
    if (err instanceof Error && err.name === 'TokenExpiredError') {
      throw new AppError(401, 'Token expired');
    }
    throw new AppError(401, 'Invalid token');
  }
}
