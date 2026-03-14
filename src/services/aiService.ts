import { AccessRequest } from '../models';
import { SENSITIVE_APP_KEYWORDS, INTERNAL_APP_KEYWORDS, HIGH_RISK_CREATOR_KEYWORDS } from '../ai/riskRules';

export interface SummaryResult {
  totalPending: number;
  summary: string;
  applications: string[];
  createdBy: string[];
}

export function summarize(requests: AccessRequest[]): SummaryResult {
  const totalPending = requests.length;
  const applications = [...new Set(requests.map((r) => r.application))];
  const createdBy = [...new Set(requests.map((r) => r.createdBy))];
  const summary =
    totalPending === 0
      ? 'No pending access requests.'
      : `There are ${totalPending} pending request(s). Applications: ${applications.join(', ') || 'none'}. Requested by: ${createdBy.join(', ') || 'n/a'}.`;
  return { totalPending, summary, applications, createdBy };
}

export type RiskLevel = 'low' | 'medium' | 'high';

export interface AnalyzeResult {
  riskLevel: RiskLevel;
  reason: string;
}

/**
 * Simple rule-based risk analysis (no external APIs).
 * - High: sensitive app names or admin-like createdBy
 * - Medium: internal/critical app names
 * - Low: everything else
 */
export function analyze(request: AccessRequest): AnalyzeResult {
  const app = request.application.toLowerCase();
  const creator = request.createdBy.toLowerCase();

  if (SENSITIVE_APP_KEYWORDS.some((s) => app.includes(s)) || HIGH_RISK_CREATOR_KEYWORDS.some((s) => creator.includes(s))) {
    return { riskLevel: 'high', reason: 'Sensitive application or admin requester' };
  }
  if (INTERNAL_APP_KEYWORDS.some((s) => app.includes(s))) {
    return { riskLevel: 'medium', reason: 'Internal or critical application' };
  }
  return { riskLevel: 'low', reason: 'Standard access request' };
}
