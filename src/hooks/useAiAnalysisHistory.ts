import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getAiAnalysisHistory, type AiAnalysisHistoryItem } from '@/services/aiAnalysisService';
import { loadSession } from '@/services/authService';

export const AI_ANALYSIS_HISTORY_KEY = ['ai-analysis-history'] as const;

export function useAiAnalysisHistory() {
  const { isAuthenticated } = useAuth();

  return useQuery<AiAnalysisHistoryItem[]>({
    queryKey: AI_ANALYSIS_HISTORY_KEY,
    queryFn: () => {
      const session = loadSession();
      return getAiAnalysisHistory(session?.accessToken ?? '');
    },
    enabled: isAuthenticated,
    staleTime: 60 * 1000, // 1 minute — refreshes after a new analysis is added
  });
}
