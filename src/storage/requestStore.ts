import { AccessRequest } from '../models';

const store = new Map<string, AccessRequest>();

/** Persists a request in memory. */
export function create(request: AccessRequest): AccessRequest {
  store.set(request.id, { ...request });
  return request;
}

/** Returns all stored requests. */
export function findAll(): AccessRequest[] {
  return Array.from(store.values());
}

/** Returns a request by id, or undefined if not found. */
export function findById(id: string): AccessRequest | undefined {
  return store.get(id);
}

/** Updates a request by merging partial fields. Returns undefined if id not found. */
export function update(id: string, partial: Partial<AccessRequest>): AccessRequest | undefined {
  const existing = store.get(id);
  if (!existing) return undefined;
  const updated = { ...existing, ...partial };
  store.set(id, updated);
  return updated;
}

/** Removes all entries from the store. Intended for use in tests only. */
export function clearStore(): void {
  store.clear();
}
