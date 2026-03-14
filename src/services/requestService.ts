import { randomUUID } from 'crypto';
import { AccessRequest, CreateRequestInput } from '../models';
import * as store from '../storage/requestStore';
import { AppError } from '../middleware';

/** Creates a new access request with status "pending" and persists it. */
export function create(input: CreateRequestInput): AccessRequest {
  const now = new Date().toISOString();
  const request: AccessRequest = {
    id: randomUUID(),
    application: input.application.trim(),
    status: 'pending',
    createdBy: input.createdBy.trim(),
    createdAt: now,
    decisionBy: null,
    decisionAt: null,
  };
  return store.create(request);
}

/** Returns all access requests. */
export function findAll(): AccessRequest[] {
  return store.findAll();
}

/** Approves a pending request by id. Sets decisionBy and decisionAt. Throws if not found or not pending. */
export function approve(id: string, decisionBy: string | undefined): AccessRequest {
  const existing = store.findById(id);
  if (!existing) {
    throw new AppError(404, `Request with id "${id}" not found`);
  }
  if (existing.status !== 'pending') {
    throw new AppError(400, `Request is already ${existing.status}`);
  }
  const updated = store.update(id, {
    status: 'approved',
    decisionBy: decisionBy?.trim() || 'approver',
    decisionAt: new Date().toISOString(),
  });
  return updated!;
}

/** Denies a pending request by id. Sets decisionBy and decisionAt. Throws if not found or not pending. */
export function deny(id: string, decisionBy: string | undefined): AccessRequest {
  const existing = store.findById(id);
  if (!existing) {
    throw new AppError(404, `Request with id "${id}" not found`);
  }
  if (existing.status !== 'pending') {
    throw new AppError(400, `Request is already ${existing.status}`);
  }
  const updated = store.update(id, {
    status: 'denied',
    decisionBy: decisionBy?.trim() || 'approver',
    decisionAt: new Date().toISOString(),
  });
  return updated!;
}

/** Returns a single request by id, or undefined if not found. */
export function findById(id: string): AccessRequest | undefined {
  return store.findById(id);
}

/** Returns only requests with status "pending". */
export function getPendingRequests(): AccessRequest[] {
  return store.findAll().filter((r) => r.status === 'pending');
}
