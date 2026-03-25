import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { onHubEvent } from '@/services/signalRService';
import { useAuth } from '@/contexts/AuthContext';

export function useRealtimeNotifications() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated) return;

    const off = onHubEvent('notification', (payload: unknown) => {
      const p = payload as { type?: string; title?: string; body?: string; actionUrl?: string };
      toast(p.title ?? 'Notification', { description: p.body });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });

    return off;
  }, [isAuthenticated, queryClient]);
}
