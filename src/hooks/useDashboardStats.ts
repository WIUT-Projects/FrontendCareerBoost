import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { loadSession } from '@/services/authService';
import { getMyResumes, getTemplates } from '@/services/resumeService';
import { getMyBookings } from '@/services/bookingService';
import { getConversations } from '@/services/messageService';
import { getJobListings } from '@/services/jobService';
import { getHrExperts } from '@/services/hrExpertService';

export interface DashboardStats {
  resumesCount: number;
  activeJobsCount: number;
  interviewsCount: number;
  conversationsCount: number;
  hrExpertsCount: number;
  templatesCount: number;
}

export function useDashboardStats() {
  const { isAuthenticated } = useAuth();

  return useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const session = loadSession();
      const token = session?.accessToken ?? '';

      const [resumesRes, bookingsRes, conversationsRes, jobsRes, hrRes, templatesRes] =
        await Promise.allSettled([
          getMyResumes(token, { pageSize: 1, pageIndex: 1 }),
          getMyBookings(token),
          getConversations(token),
          getJobListings({ pageSize: 1, status: 'active' }),
          getHrExperts({ pageSize: 1 }),
          getTemplates({ pageSize: 1 }),
        ]);

      return {
        resumesCount:
          resumesRes.status === 'fulfilled' ? (resumesRes.value.totalCount ?? 0) : 0,
        activeJobsCount:
          jobsRes.status === 'fulfilled' ? (jobsRes.value.totalCount ?? 0) : 0,
        interviewsCount:
          bookingsRes.status === 'fulfilled' ? bookingsRes.value.length : 0,
        conversationsCount:
          conversationsRes.status === 'fulfilled' ? conversationsRes.value.length : 0,
        hrExpertsCount:
          hrRes.status === 'fulfilled' ? (hrRes.value.totalCount ?? 0) : 0,
        templatesCount:
          templatesRes.status === 'fulfilled' ? (templatesRes.value.totalCount ?? 0) : 0,
      };
    },
    enabled: isAuthenticated,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
  });
}
