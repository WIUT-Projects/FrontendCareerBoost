import { loadSession } from './authService';

const API_URL = import.meta.env.VITE_API_URL;

export interface AiAnalysisResult {
  id: number;
  resumeId: number | null;
  resumeTitle: string | null;
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

export interface AiAnalysisHistoryItem {
  id: number;
  resumeId: number | null;
  resumeTitle: string | null;
  totalScore: number | null;
  modelUsed: string | null;
  createdAt: string;
}

export async function analyzeResumeById(
  resumeId: number,
  token: string
): Promise<AiAnalysisResult> {
  const response = await fetch(`${API_URL}/api/ai-analysis/resume/${resumeId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to analyze resume: ${response.statusText}`);
  }

  return response.json();
}

export async function analyzeResumePdf(
  file: File,
  token: string
): Promise<AiAnalysisResult> {
  const form = new FormData();
  form.append('file', file);

  const response = await fetch(`${API_URL}/api/ai-analysis/pdf`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  if (!response.ok) {
    throw new Error(`Failed to analyze PDF: ${response.statusText}`);
  }

  return response.json();
}

export async function getAiAnalysisHistory(
  token: string
): Promise<AiAnalysisHistoryItem[]> {
  const response = await fetch(`${API_URL}/api/ai-analysis/history`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch analysis history: ${response.statusText}`);
  }

  return response.json();
}
