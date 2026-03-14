import { useState, useEffect, useCallback } from 'react';
import { getRequests } from './api';
import type { AccessRequest } from './types';
import { CreateRequestForm } from './components/CreateRequestForm';
import { RequestsTable } from './components/RequestsTable';
import { AiSummary } from './components/AiSummary';

function App() {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const data = await getRequests();
      setRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="app">
      <header>
        <h1>Access Request Manager</h1>
      </header>
      <main>
        <CreateRequestForm onCreated={refresh} />
        <RequestsTable requests={requests} onRefresh={refresh} />
        <AiSummary />
      </main>
      {loading && <p className="loading">Loading requests…</p>}
      {error && <p className="error global">{error}</p>}
    </div>
  );
}

export default App;
