import { useState, useEffect, useCallback, useRef } from 'react';
import { getRequests, setOnUnauthorized } from './api';
import type { AccessRequest } from './types';
import { useAuth } from './context/AuthContext';
import { LoginPage } from './components/LoginPage';
import { CreateRequestForm } from './components/CreateRequestForm';
import { RequestsTable } from './components/RequestsTable';
import { AiSummary } from './components/AiSummary';

function App() {
  const { isAuthenticated, user, logout } = useAuth();
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [requesterNames, setRequesterNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterCreatedBy, setFilterCreatedBy] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const initialLoadDone = useRef(false);

  useEffect(() => {
    setOnUnauthorized(logout);
  }, [logout]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'approver') {
      initialLoadDone.current = false;
      return;
    }
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;
    getRequests().then((data) => {
      const names = Array.from(new Set(data.map((r) => r.createdBy))).sort();
      setRequesterNames(names);
    }).catch(() => {});
  }, [isAuthenticated, user?.role]);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    setError(null);
    setLoading(true);
    try {
      const filters: { createdBy?: string; status?: string } = {};
      if (user?.role === 'approver') {
        if (filterCreatedBy.trim()) filters.createdBy = filterCreatedBy.trim();
      }
      if (filterStatus) filters.status = filterStatus;
      const data = await getRequests(filters);
      setRequests(data);

      if (user?.role === 'approver' && !filterCreatedBy.trim()) {
        const names = Array.from(new Set(data.map((r) => r.createdBy))).sort();
        setRequesterNames(names);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.role, filterCreatedBy, filterStatus]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="app">
      <header>
        <h1>Access Request Manager</h1>
        <div className="header-bar">
          <span className="user-info">
            Signed in as <strong>{user?.username}</strong> ({user?.role})
          </span>
          <button type="button" className="btn-logout" onClick={logout}>
            Sign Out
          </button>
        </div>
      </header>
      <main>
        {user?.role === 'requester' && (
          <>
            <CreateRequestForm onCreated={refresh} />
            <RequestsTable
              requests={requests}
              onRefresh={refresh}
              showActions={false}
              showFilters={false}
            />
          </>
        )}
        {user?.role === 'approver' && (
          <>
            <RequestsTable
              requests={requests}
              onRefresh={refresh}
              filterCreatedBy={filterCreatedBy}
              onFilterCreatedByChange={setFilterCreatedBy}
              filterStatus={filterStatus}
              onFilterStatusChange={setFilterStatus}
              requesterNames={requesterNames}
            />
            <AiSummary />
          </>
        )}
      </main>
      {loading && <p className="loading">Loading requests...</p>}
      {error && <p className="error global">{error}</p>}
    </div>
  );
}

export default App;
