import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Sparkles, MessageSquare, ArrowLeft, Send } from 'lucide-react';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getConversations, getMessages, sendMessage, markAsRead,
  type ConversationItem, type MessageItem,
} from '@/services/messageService';
import { onHubEvent } from '@/services/signalRService';
import { resolveMediaUrl } from '@/lib/utils';
import { formatDistanceToNow, format, isToday, isYesterday, isSameDay } from 'date-fns';

function dateSeparatorLabel(d: Date) {
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'd MMMM yyyy');
}
function PanelDateSep({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 my-1.5">
      <div className="flex-1 h-px bg-border" />
      <span className="text-[9px] font-medium text-muted-foreground shrink-0">{label}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}
import { Button } from '@/components/ui/button';

function HrMessagesPanel() {
  const { t } = useTranslation();
  const { session, profile } = useAuth();
  const [open, setOpen]           = useState(false);
  const [convs, setConvs]         = useState<ConversationItem[]>([]);
  const [active, setActive]       = useState<ConversationItem | null>(null);
  const [messages, setMessages]   = useState<MessageItem[]>([]);
  const [input, setInput]         = useState('');
  const [sending, setSending]     = useState(false);
  const bottomRef                 = useRef<HTMLDivElement>(null);

  const myId = Number(profile?.id ?? 0);

  // ── conversations ──────────────────────────────────────────────────────────
  const loadConvs = useCallback(() => {
    if (!session?.access_token) return;
    getConversations(session.access_token).then(setConvs).catch(() => {});
  }, [session?.access_token]);

  useEffect(() => { loadConvs(); }, [loadConvs]);
  useEffect(() => onHubEvent('new_message', loadConvs), [loadConvs]);

  // ── chat view ──────────────────────────────────────────────────────────────
  const openChat = useCallback((conv: ConversationItem) => {
    if (!session?.access_token) return;
    setActive(conv);
    setMessages([]);
    getMessages(session.access_token, conv.partnerId).then(msgs => {
      setMessages(msgs);
      markAsRead(session.access_token, conv.partnerId);
      setConvs(prev => prev.map(c => c.partnerId === conv.partnerId ? { ...c, unreadCount: 0 } : c));
    }).catch(() => {});
  }, [session?.access_token]);

  // incoming messages for active chat
  useEffect(() => {
    if (!active) return;
    return onHubEvent('new_message', (raw: unknown) => {
      const p = raw as { senderId: number; senderName: string; senderAvatar: string; body: string; createdAt: string };
      if (p.senderId !== active.partnerId) return;
      setMessages(prev => [...prev, {
        id: Date.now(), senderId: p.senderId, senderName: p.senderName,
        senderAvatar: p.senderAvatar, body: p.body, isRead: false, createdAt: p.createdAt,
      }]);
      if (session?.access_token) markAsRead(session.access_token, active.partnerId);
    });
  }, [active, session?.access_token]);

  // scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !session || !active || sending) return;
    const body = input.trim();
    setInput('');
    setSending(true);
    try {
      const msg = await sendMessage(session.access_token, active.partnerId, body);
      setMessages(prev => [...prev, msg]);
      loadConvs();
    } catch {
      setInput(body);
    } finally {
      setSending(false);
    }
  };

  const unread = convs.reduce((s, c) => s + c.unreadCount, 0);

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <button
        onClick={() => { loadConvs(); setOpen(true); }}
        className="relative h-8 w-8 rounded-full flex items-center justify-center hover:bg-accent/60 transition-colors"
      >
        <MessageSquare className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-[10px] text-primary-foreground font-bold flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      <Sheet open={open} onOpenChange={v => { setOpen(v); if (!v) setActive(null); }}>
        <SheetContent side="right" className="w-[360px] p-0 flex flex-col">

          {/* ── Conversation list view ── */}
          {!active && (
            <>
              <SheetHeader className="px-4 py-3 border-b shrink-0">
                <SheetTitle className="text-sm">{t('messages.title')}</SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto">
                {convs.length === 0 ? (
                  <div className="py-16 text-center text-xs text-muted-foreground">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    {t('messages.noConversations')}
                  </div>
                ) : (
                  <div className="divide-y">
                    {convs.map(c => {
                      const initials = c.partnerName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? '?';
                      return (
                        <button
                          key={c.partnerId}
                          onClick={() => openChat(c)}
                          className="w-full flex gap-3 items-center px-4 py-3 hover:bg-accent/40 transition-colors text-left"
                        >
                          <div className="relative shrink-0">
                            <Avatar className="h-9 w-9">
                              {c.partnerAvatar && <AvatarImage src={resolveMediaUrl(c.partnerAvatar)} alt={c.partnerName ?? ''} />}
                              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{initials}</AvatarFallback>
                            </Avatar>
                            {c.unreadCount > 0 && (
                              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-[10px] text-primary-foreground font-bold flex items-center justify-center">
                                {c.unreadCount > 9 ? '9+' : c.unreadCount}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline">
                              <p className={`text-xs truncate ${c.unreadCount > 0 ? 'font-bold' : 'font-medium'}`}>
                                {c.partnerName ?? t('messages.unknownUser')}
                              </p>
                              {c.lastMessageAt && (
                                <span className="text-[10px] text-muted-foreground ml-2 shrink-0">
                                  {formatDistanceToNow(new Date(c.lastMessageAt), { addSuffix: true })}
                                </span>
                              )}
                            </div>
                            <p className={`text-[11px] truncate mt-0.5 ${c.unreadCount > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {c.lastMessage ?? ''}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── Chat view ── */}
          {active && (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-2.5 px-3 py-3 border-b shrink-0">
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => setActive(null)}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Avatar className="h-7 w-7 shrink-0">
                  {active.partnerAvatar && <AvatarImage src={resolveMediaUrl(active.partnerAvatar)} alt={active.partnerName ?? ''} />}
                  <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                    {active.partnerName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? '?'}
                  </AvatarFallback>
                </Avatar>
                <p className="text-sm font-semibold truncate">{active.partnerName}</p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
                {messages.map((msg, i) => {
                  const isMe = msg.senderId === myId;
                  const msgDate = new Date(msg.createdAt);
                  const prevDate = i > 0 ? new Date(messages[i - 1].createdAt) : null;
                  const showSep = !prevDate || !isSameDay(msgDate, prevDate);
                  return (
                    <div key={msg.id}>
                      {showSep && <PanelDateSep label={dateSeparatorLabel(msgDate)} />}
                      <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[78%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                          isMe ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-muted rounded-bl-sm'
                        }`}>
                          <p>{msg.body}</p>
                          <p className={`text-[9px] mt-0.5 ${isMe ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                            {format(msgDate, 'HH:mm')}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="px-3 py-2.5 border-t bg-card shrink-0 flex gap-2 items-end">
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder={t('messages.writeMessage')}
                  rows={1}
                  className="flex-1 resize-none rounded-xl border bg-muted/30 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[36px] max-h-24"
                />
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className="rounded-xl h-9 w-9 shrink-0"
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            </>
          )}

        </SheetContent>
      </Sheet>
    </>
  );
}

export function AppLayout() {
  const { profile } = useAuth();
  useRealtimeNotifications();
  const isJobseeker = !profile?.role || profile.role === 'jobseeker';

  // Jobseeker: header-only nav (no sidebar)
  if (isJobseeker) {
    return (
      <div className="h-screen flex flex-col w-full overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-y-auto animate-fade-in">
          <Outlet />
        </main>
      </div>
    );
  }

  // HR / Admin: sidebar layout
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b bg-card px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center lg:hidden">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <HrMessagesPanel />
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 p-6 animate-fade-in overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
