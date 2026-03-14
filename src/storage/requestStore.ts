import { AccessRequest } from '../models';

const store = new Map<string, AccessRequest>();

export function create(request: AccessRequest): AccessRequest {
  store.set(request.id, { ...request });
  return request;
}

export function findAll(): AccessRequest[] {
  return Array.from(store.values());
}

export function findById(id: string): AccessRequest | undefined {
  return store.get(id);
}

export function update(id: string, partial: Partial<AccessRequest>): AccessRequest | undefined {
  const existing = store.get(id);
  if (!existing) return undefined;
  const updated = { ...existing, ...partial };
  store.set(id, updated);
  return updated;
}
