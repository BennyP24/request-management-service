import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function validateCreateRequest(req: Request, _res: Response, next: NextFunction): void {
  const body = req.body;
  if (!body || typeof body !== 'object') {
    throw new AppError(400, 'Request body must be a JSON object');
  }
  if (!isNonEmptyString(body.application)) {
    throw new AppError(400, 'Field "application" is required and must be a non-empty string');
  }
  if (!isNonEmptyString(body.createdBy)) {
    throw new AppError(400, 'Field "createdBy" is required and must be a non-empty string');
  }
  next();
}

export function validateDecisionBody(req: Request, _res: Response, next: NextFunction): void {
  const body = req.body;
  if (body !== undefined && (body === null || typeof body !== 'object')) {
    throw new AppError(400, 'Request body must be a JSON object when provided');
  }
  if (body?.decisionBy !== undefined && !isNonEmptyString(body.decisionBy)) {
    throw new AppError(400, 'Field "decisionBy" must be a non-empty string when provided');
  }
  next();
}

export function validateAnalyzeBody(req: Request, _res: Response, next: NextFunction): void {
  const body = req.body;
  if (!body || typeof body !== 'object') {
    throw new AppError(400, 'Request body must be a JSON object');
  }
  if (body.requestId !== undefined && !isNonEmptyString(body.requestId)) {
    throw new AppError(400, 'Field "requestId" must be a non-empty string when provided');
  }
  if (!body.requestId && !body.request) {
    throw new AppError(400, 'Either "requestId" or "request" is required');
  }
  next();
}
