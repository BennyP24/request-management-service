import { useState } from 'react';
import { createRequest } from '../api';
import { useAuth } from '../context/AuthContext';

interface CreateRequestFormProps {
  onCreated: () => void;
}

export function CreateRequestForm({ onCreated }: CreateRequestFormProps) {
  const { user } = useAuth();
  const [application, setApplication] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await createRequest({ application });
      setApplication('');
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create request');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card">
      <h2>Create Request</h2>
      <p className="requester-name">Requesting as: <strong>{user?.username}</strong></p>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="application">Application</label>
          <input
            id="application"
            value={application}
            onChange={(e) => setApplication(e.target.value)}
            required
          />
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Request'}
        </button>
      </form>
    </section>
  );
}
