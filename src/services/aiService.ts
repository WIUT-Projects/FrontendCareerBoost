const API_URL = import.meta.env.VITE_API_URL ?? '';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AiAnalysisResult {
  id: number;
  resumeId: number;
  totalScore: number | null;
  structureScore: number | null;
  grammarScore: number | null;
  impactScore: number | null;
  suggestions: string[];
  gapSkills: string[];
  modelUsed: string | null;
  tokensUsed: number | null;
  createdAt: string;
}

// ── API calls ─────────────────────────────────────────────────────────────────

/** Sends resume sections to Gemini and returns the analysis result. */
export async function analyzeResume(
  resumeId: number,
  token: string,
): Promise<AiAnalysisResult> {
  const res = await fetch(`${API_URL}/api/ai-analysis/resume/${resumeId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { title?: string }).title ?? 'AI analysis failed');
  }

  return res.json() as Promise<AiAnalysisResult>;
}

/** Returns the latest saved analysis without running a new one. */
export async function getLatestAnalysis(
  resumeId: number,
  token: string,
): Promise<AiAnalysisResult | null> {
  const res = await fetch(`${API_URL}/api/ai-analysis/resume/${resumeId}/latest`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to fetch analysis');

  return res.json() as Promise<AiAnalysisResult>;
}
