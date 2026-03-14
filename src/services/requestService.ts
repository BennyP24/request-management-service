import { randomUUID } from 'crypto';
import { AccessRequest, CreateRequestInput, RequestStatus } from '../models';
import * as store from '../storage/requestStore';
import { AppError } from '../middleware';

export interface FindAllFilters {
  createdBy?: string;
  status?: RequestStatus;
}

/** Creates a new access request with status "pending" and persists it. */
export function create(input: CreateRequestInput, requesterId: string, createdBy: string): AccessRequest {
  const now = new Date().toISOString();
  const request: AccessRequest = {
    id: randomUUID(),
    application: input.application.trim(),
    status: 'pending',
    requesterId,
    createdBy: createdBy.trim(),
    createdAt: now,
    decisionBy: null,
    decisionAt: null,
  };
  return store.create(request);
}

/** Returns all access requests, optionally filtered by createdBy and/or status. */
export function findAll(filters?: FindAllFilters): AccessRequest[] {
  let results = store.findAll();
  if (filters?.createdBy) {
    results = results.filter((r) => r.createdBy === filters.createdBy);
  }
  if (filters?.status) {
    results = results.filter((r) => r.status === filters.status);
  }
  return results;
}

/** Approves a pending request by id. Sets decisionBy and decisionAt. Throws if not found or not pending. */
export function approve(id: string, decisionBy: string): AccessRequest {
  const existing = store.findById(id);
  if (!existing) {
    throw new AppError(404, `Request with id "${id}" not found`);
  }
  if (existing.status !== 'pending') {
    throw new AppError(400, `Request is already ${existing.status}`);
  }
  const updated = store.update(id, {
    status: 'approved',
    decisionBy: decisionBy.trim(),
    decisionAt: new Date().toISOString(),
  });
  return updated!;
}

/** Denies a pending request by id. Sets decisionBy and decisionAt. Throws if not found or not pending. */
export function deny(id: string, decisionBy: string): AccessRequest {
  const existing = store.findById(id);
  if (!existing) {
    throw new AppError(404, `Request with id "${id}" not found`);
  }
  if (existing.status !== 'pending') {
    throw new AppError(400, `Request is already ${existing.status}`);
  }
  const updated = store.update(id, {
    status: 'denied',
    decisionBy: decisionBy.trim(),
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
