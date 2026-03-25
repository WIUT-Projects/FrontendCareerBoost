import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getConversations } from '@/services/messageService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { resolveMediaUrl } from '@/lib/utils';
import { MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { onHubEvent } from '@/services/signalRService';

export default function MessagesPage() {
  const { session } = useAuth();
  const navigate = useNavigate();

  const { data: conversations = [], isLoading, refetch } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => getConversations(session!.access_token),
    enabled: !!session,
  });

  // Real-time: refresh conversation list on new message
  useEffect(() => {
    return onHubEvent('new_message', () => refetch());
  }, [refetch]);

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-6 space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-3 p-3">
            <Skeleton className="h-11 w-11 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-5">Messages</h1>

      {conversations.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No conversations yet</p>
          <p className="text-sm mt-1">Start a conversation from an HR expert's profile.</p>
        </div>
      ) : (
        <div className="divide-y">
          {conversations.map(conv => {
            const initials = conv.partnerName
              ?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? '?';
            return (
              <button
                key={conv.partnerId}
                onClick={() => navigate(`/messages/${conv.partnerId}`)}
                className="w-full flex gap-3 items-center py-3 hover:bg-muted/40 rounded-xl px-2 transition-colors text-left"
              >
                <div className="relative shrink-0">
                  <Avatar className="h-11 w-11">
                    {conv.partnerAvatar && (
                      <AvatarImage src={resolveMediaUrl(conv.partnerAvatar)} alt={conv.partnerName ?? ''} />
                    )}
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  {conv.unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                      {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <p className={`text-sm ${conv.unreadCount > 0 ? 'font-bold' : 'font-medium'} truncate`}>
                      {conv.partnerName ?? 'Unknown'}
                    </p>
                    {conv.lastMessageAt && (
                      <span className="text-[11px] text-muted-foreground shrink-0 ml-2">
                        {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                  <p className={`text-xs truncate mt-0.5 ${conv.unreadCount > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                    {conv.lastMessage ?? ''}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
