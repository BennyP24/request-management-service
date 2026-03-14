import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/** Validates POST /auth/login body: requires non-empty username and password. */
export function validateLoginBody(req: Request, _res: Response, next: NextFunction): void {
  const body = req.body;
  if (!body || typeof body !== 'object') {
    throw new AppError(400, 'Request body must be a JSON object');
  }
  if (!isNonEmptyString(body.username)) {
    throw new AppError(400, 'Field "username" is required and must be a non-empty string');
  }
  if (!isNonEmptyString(body.password)) {
    throw new AppError(400, 'Field "password" is required and must be a non-empty string');
  }
  next();
}

/** Validates POST /requests body: requires non-empty application. */
export function validateCreateRequest(req: Request, _res: Response, next: NextFunction): void {
  const body = req.body;
  if (!body || typeof body !== 'object') {
    throw new AppError(400, 'Request body must be a JSON object');
  }
  if (!isNonEmptyString(body.application)) {
    throw new AppError(400, 'Field "application" is required and must be a non-empty string');
  }
  next();
}

/** Validates approve/deny body: if present, body must be object and decisionBy must be non-empty string. */
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

/** Validates POST /ai/analyze body: requires either requestId or request object. */
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
