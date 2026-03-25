import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getMyResumes } from '@/services/resumeService';
import { loadSession } from '@/services/authService';
import type { ResumeDto } from '@/types/resume';

export const RECENT_RESUMES_KEY = ['recent-resumes'] as const;

export function useRecentResumes() {
  const { isAuthenticated } = useAuth();

  return useQuery<ResumeDto[]>({
    queryKey: RECENT_RESUMES_KEY,
    queryFn: async () => {
      const session = loadSession();
      const res = await getMyResumes(session?.accessToken ?? '', { pageSize: 3, pageIndex: 0 });
      return res.items ?? [];
    },
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
