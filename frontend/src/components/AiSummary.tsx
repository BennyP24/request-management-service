import { useState } from 'react';
import { getAiSummary } from '../api';
import type { SummaryResult } from '../types';

export function AiSummary() {
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const data = await getAiSummary();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load summary');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card">
      <h2>AI Summary</h2>
      <button type="button" onClick={handleClick} disabled={loading}>
        {loading ? 'Loading…' : 'Generate Summary'}
      </button>
      {error && <p className="error">{error}</p>}
      {result && (
        <div className="summary-result">
          <p><strong>Total pending:</strong> {result.totalPending}</p>
          <p>{result.summary}</p>
          {result.applications.length > 0 && (
            <p><strong>Applications:</strong> {result.applications.join(', ')}</p>
          )}
          {result.createdBy.length > 0 && (
            <p><strong>Created by:</strong> {result.createdBy.join(', ')}</p>
          )}
        </div>
      )}
    </section>
  );
}
