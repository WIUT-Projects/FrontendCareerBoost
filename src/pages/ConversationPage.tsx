import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getMessages, sendMessage, markAsRead, type MessageItem } from '@/services/messageService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { resolveMediaUrl } from '@/lib/utils';
import { ArrowLeft, Send } from 'lucide-react';
import { onHubEvent } from '@/services/signalRService';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';

function dateSeparatorLabel(date: Date): string {
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'd MMMM yyyy');
}

function DateSeparator({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-2">
      <div className="flex-1 h-px bg-border" />
      <span className="text-[10px] font-medium text-muted-foreground px-1 shrink-0">{label}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

export default function ConversationPage() {
  const { userId } = useParams<{ userId: string }>();
  const partnerId = Number(userId);
  const navigate = useNavigate();
  const { session, profile } = useAuth();
  const queryClient = useQueryClient();
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', partnerId],
    queryFn: () => getMessages(session!.access_token, partnerId),
    enabled: !!session && !!partnerId,
  });

  // Mark as read when opening the conversation
  useEffect(() => {
    if (session && partnerId) {
      markAsRead(session.access_token, partnerId);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  }, [session, partnerId, queryClient]);

  // Real-time: append incoming messages
  useEffect(() => {
    const off = onHubEvent('new_message', (raw: unknown) => {
      const payload = raw as {
        senderId: number; senderName: string; senderAvatar: string; body: string; createdAt: string;
      };
      if (payload.senderId !== partnerId) return;
      queryClient.setQueryData<MessageItem[]>(['messages', partnerId], prev => [
        ...(prev ?? []),
        {
          id: Date.now(),
          senderId: payload.senderId,
          senderName: payload.senderName,
          senderAvatar: payload.senderAvatar,
          body: payload.body,
          isRead: false,
          createdAt: payload.createdAt,
        },
      ]);
      markAsRead(session!.access_token, partnerId);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    });
    return off;
  }, [partnerId, session, queryClient]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const myId = Number(profile?.id ?? session?.user?.id ?? 0);
  const isJobSeeker = profile?.role?.toLowerCase() === 'jobseeker';

  const handleSend = async () => {
    if (!input.trim() || !session || sending) return;
    const body = input.trim();
    setInput('');
    setSending(true);
    try {
      const msg = await sendMessage(session.access_token, partnerId, body);
      queryClient.setQueryData<MessageItem[]>(['messages', partnerId], prev => [
        ...(prev ?? []),
        msg,
      ]);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    } catch {
      setInput(body);
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Derive partner name from messages
  const partnerMsg = messages.find(m => m.senderId === partnerId);
  const partnerName = partnerMsg?.senderName ?? `User ${partnerId}`;
  const partnerAvatar = partnerMsg?.senderAvatar;
  const partnerInitials = partnerName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-card shrink-0">
        <Button variant="ghost" size="icon" onClick={() => navigate('/messages')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <button
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity disabled:pointer-events-none"
          onClick={() => isJobSeeker && navigate(`/hr/${partnerId}`)}
          disabled={!isJobSeeker}
        >
          <Avatar className="h-8 w-8">
            {partnerAvatar && <AvatarImage src={resolveMediaUrl(partnerAvatar)} alt={partnerName} />}
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
              {partnerInitials}
            </AvatarFallback>
          </Avatar>
          <p className="font-semibold text-sm">{partnerName}</p>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : ''}`}>
                <Skeleton className="h-10 w-48 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.senderId === myId;
            const msgDate = new Date(msg.createdAt);
            const prevDate = i > 0 ? new Date(messages[i - 1].createdAt) : null;
            const showSeparator = !prevDate || !isSameDay(msgDate, prevDate);
            return (
              <div key={msg.id}>
                {showSeparator && <DateSeparator label={dateSeparatorLabel(msgDate)} />}
                <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[72%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isMe
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-muted rounded-bl-sm'
                    }`}
                  >
                    <p>{msg.body}</p>
                    <p className={`text-[10px] mt-1 ${isMe ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                      {format(msgDate, 'HH:mm')}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t bg-card shrink-0 flex gap-2 items-end">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Write a message..."
          rows={1}
          className="flex-1 resize-none rounded-xl border bg-muted/30 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[40px] max-h-28"
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!input.trim() || sending}
          className="rounded-xl h-10 w-10 shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
