import { randomUUID } from 'crypto';
import { AccessRequest, CreateRequestInput } from '../models';
import * as store from '../storage/requestStore';
import { AppError } from '../middleware';

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

export function findAll(): AccessRequest[] {
  return store.findAll();
}

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
    decisionBy: decisionBy ?? existing.createdBy,
    decisionAt: new Date().toISOString(),
  });
  return updated!;
}

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
    decisionBy: decisionBy ?? existing.createdBy,
    decisionAt: new Date().toISOString(),
  });
  return updated!;
}

export function findById(id: string): AccessRequest | undefined {
  return store.findById(id);
}

export function getPendingRequests(): AccessRequest[] {
  return store.findAll().filter((r) => r.status === 'pending');
}
