import { useState } from 'react';
import type { AccessRequest } from '../types';
import { approveRequest, denyRequest } from '../api';

interface RequestsTableProps {
  requests: AccessRequest[];
  onRefresh: () => void;
  filterCreatedBy?: string;
  onFilterCreatedByChange?: (v: string) => void;
  filterStatus?: string;
  onFilterStatusChange?: (v: string) => void;
  showActions?: boolean;
  showFilters?: boolean;
  requesterNames?: string[];
}

export function RequestsTable({
  requests,
  onRefresh,
  filterCreatedBy = '',
  onFilterCreatedByChange,
  filterStatus = '',
  onFilterStatusChange,
  showActions = true,
  showFilters = true,
  requesterNames = [],
}: RequestsTableProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleApprove(id: string) {
    setError(null);
    setLoadingId(id);
    try {
      await approveRequest(id);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve');
    } finally {
      setLoadingId(null);
    }
  }

  async function handleDeny(id: string) {
    setError(null);
    setLoadingId(id);
    try {
      await denyRequest(id);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deny');
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <section className="card">
      <h2>Requests</h2>
      {showFilters && (
        <div className="filters">
          <div className="field filter-field">
            <label htmlFor="filterCreatedBy">Filter by requester</label>
            <select
              id="filterCreatedBy"
              value={filterCreatedBy}
              onChange={(e) => onFilterCreatedByChange?.(e.target.value)}
            >
              <option value="">All</option>
              {requesterNames.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
          <div className="field filter-field">
            <label htmlFor="filterStatus">Filter by status</label>
            <select
              id="filterStatus"
              value={filterStatus}
              onChange={(e) => onFilterStatusChange?.(e.target.value)}
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="denied">Denied</option>
            </select>
          </div>
        </div>
      )}
      {error && <p className="error">{error}</p>}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>id</th>
              <th>application</th>
              <th>status</th>
              <th>createdBy</th>
              <th>createdAt</th>
              {showActions && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan={showActions ? 6 : 5}>No requests found.</td>
              </tr>
            ) : (
              requests.map((r) => (
                <tr key={r.id}>
                  <td className="id">{r.id}</td>
                  <td>{r.application}</td>
                  <td><span className={`status status-${r.status}`}>{r.status}</span></td>
                  <td>{r.createdBy}</td>
                  <td>{new Date(r.createdAt).toLocaleString()}</td>
                  {showActions && (
                    <td>
                      {r.status === 'pending' && (
                        <>
                          <button
                            type="button"
                            className="btn-approve"
                            onClick={() => handleApprove(r.id)}
                            disabled={loadingId !== null}
                          >
                            {loadingId === r.id ? '...' : 'Approve'}
                          </button>
                          <button
                            type="button"
                            className="btn-deny"
                            onClick={() => handleDeny(r.id)}
                            disabled={loadingId !== null}
                          >
                            {loadingId === r.id ? '...' : 'Deny'}
                          </button>
                        </>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
