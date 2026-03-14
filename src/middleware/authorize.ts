import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/user';
import { AppError } from './errorHandler';

export function authorize(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new AppError(403, 'Forbidden: insufficient permissions');
    }
    next();
  };
}
