import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getMySubscriptionStatus, type SubscriptionStatus } from '@/services/subscriptionService';

export const SUBSCRIPTION_STATUS_KEY = ['subscription-status'] as const;

export function useSubscriptionStatus() {
  const { isAuthenticated } = useAuth();

  return useQuery<SubscriptionStatus>({
    queryKey: SUBSCRIPTION_STATUS_KEY,
    queryFn: getMySubscriptionStatus,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes — subscription rarely changes
  });
}
