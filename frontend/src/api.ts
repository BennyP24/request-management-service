import type { AccessRequest, SummaryResult } from './types';

const BASE = 'http://localhost:3000';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error || res.statusText);
  }
  return res.json();
}

export async function createRequest(data: { application: string; createdBy: string }) {
  return request<AccessRequest>('/requests', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getRequests() {
  return request<AccessRequest[]>('/requests');
}

export async function approveRequest(id: string) {
  return request<AccessRequest>(`/requests/${id}/approve`, {
    method: 'POST',
    body: JSON.stringify({ decisionBy: 'manager' }),
  });
}

export async function denyRequest(id: string) {
  return request<AccessRequest>(`/requests/${id}/deny`, {
    method: 'POST',
    body: JSON.stringify({ decisionBy: 'manager' }),
  });
}

export async function getAiSummary() {
  return request<SummaryResult>('/ai/summary');
}
