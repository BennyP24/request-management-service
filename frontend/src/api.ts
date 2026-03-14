import type { AccessRequest, LoginResponse, SummaryResult } from './types';

const BASE = 'http://localhost:3000';

let onUnauthorized: (() => void) | null = null;

/** Register a callback invoked when the server returns 401 (auto-logout). */
export function setOnUnauthorized(cb: () => void) {
  onUnauthorized = cb;
}

function getToken(): string | null {
  return localStorage.getItem('token');
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> | undefined),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    onUnauthorized?.();
    throw new Error('Session expired. Please log in again.');
  }

  if (res.status === 403) {
    throw new Error('You do not have permission to perform this action.');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error || res.statusText);
  }

  return res.json();
}

export async function login(username: string, password: string) {
  return request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function createRequest(data: { application: string }) {
  return request<AccessRequest>('/requests', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getRequests(filters?: { createdBy?: string; status?: string }) {
  const params = new URLSearchParams();
  if (filters?.createdBy) params.set('createdBy', filters.createdBy);
  if (filters?.status) params.set('status', filters.status);
  const qs = params.toString();
  return request<AccessRequest[]>(`/requests${qs ? `?${qs}` : ''}`);
}

export async function approveRequest(id: string) {
  return request<AccessRequest>(`/requests/${id}/approve`, { method: 'POST' });
}

export async function denyRequest(id: string) {
  return request<AccessRequest>(`/requests/${id}/deny`, { method: 'POST' });
}

export async function getAiSummary() {
  return request<SummaryResult>('/ai/summary');
}
