import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Bell, Settings, Sparkles, ArrowLeft, Send } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';
import { NavLink } from '@/components/NavLink';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { resolveMediaUrl } from '@/lib/utils';
import {
  LayoutDashboard, FileText, Palette, Brain, Users, Briefcase,
  MessageSquare, BookOpen, Calendar, Star, ClipboardList, BarChart3,
  CreditCard, UserCheck, ScrollText,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getNotifications, markAllRead, markRead, type NotificationItem } from '@/services/notificationService';
import {
  getConversations, getMessages, sendMessage, markAsRead,
  type ConversationItem, type MessageItem,
} from '@/services/messageService';
import { onHubEvent } from '@/services/signalRService';
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

function MessagesPanel() {
  const { t } = useTranslation();
  const { session, profile } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen]         = useState(false);
  const [convs, setConvs]       = useState<ConversationItem[]>([]);
  const [active, setActive]     = useState<ConversationItem | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [input, setInput]       = useState('');
  const [sending, setSending]   = useState(false);
  const bottomRef               = useRef<HTMLDivElement>(null);
  const myId = Number(profile?.id ?? 0);

  const loadConvs = useCallback(() => {
    if (!session?.access_token) return;
    getConversations(session.access_token).then(setConvs).catch(() => {});
  }, [session?.access_token]);

  useEffect(() => { loadConvs(); }, [loadConvs]);
  useEffect(() => onHubEvent('new_message', loadConvs), [loadConvs]);

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

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !session || !active || sending) return;
    const body = input.trim();
    setInput('');
    setSending(true);
    try {
      const msg = await sendMessage(session.access_token, active.partnerId, body);
      setMessages(prev => [...prev, msg]);
      loadConvs();
    } catch { setInput(body); }
    finally { setSending(false); }
  };

  const unread = convs.reduce((s, c) => s + c.unreadCount, 0);

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

          {active && (
            <>
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
                <button
                  className="text-sm font-semibold truncate hover:underline"
                  onClick={() => { setOpen(false); navigate(`/hr/${active.partnerId}`); }}
                >
                  {active.partnerName}
                </button>
              </div>

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

export function AppHeader() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = () => {
    signOut();
    navigate('/');
  };

  const initials = profile?.fullName
    ? profile.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  // ─── Notifications ─────────────────────────────────────────────────────────
  const { session } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchNotifications = () => {
    if (!session?.access_token) return;
    getNotifications(session.access_token)
      .then(setNotifications)
      .catch(() => {});
  };

  useEffect(() => {
    fetchNotifications();
    pollRef.current = setInterval(fetchNotifications, 60_000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [session?.access_token]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleNotifClick = async (n: NotificationItem) => {
    if (!session?.access_token) return;
    if (!n.isRead) {
      await markRead(session.access_token, n.id).catch(() => {});
      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, isRead: true } : x));
    }
    setNotifOpen(false);
    if (n.actionUrl) navigate(n.actionUrl);
  };

  const handleMarkAll = async () => {
    if (!session?.access_token) return;
    await markAllRead(session.access_token).catch(() => {});
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const isJobseeker = !profile?.role || profile.role === 'jobseeker';
  const isHr = profile?.role === 'hr_expert';
  const isAdmin = profile?.role === 'admin';

  const jobSeekerNav = [
    { title: t('sidebar.dashboard'), url: '/dashboard', icon: LayoutDashboard },
    { title: t('sidebar.templates'), url: '/templates', icon: Palette },
    { title: t('sidebar.aiAnalysis'), url: '/ai-analysis', icon: Brain },
    { title: t('sidebar.hrExperts'), url: '/hr', icon: Users },
    { title: t('sidebar.jobs'), url: '/jobs', icon: Briefcase },
    { title: t('sidebar.blog'), url: '/blog', icon: BookOpen },
  ];

  const jobSeekerProfileItems = [
    { title: t('sidebar.myResumes'),    url: '/resumes',               icon: FileText      },
    { title: t('sidebar.messages'),     url: '/messages',              icon: MessageSquare },
    { title: t('sidebar.interviews'),   url: '/interviews',            icon: Calendar      },
    { title: t('sidebar.myJobListings'), url: '/jobs/manage',          icon: ClipboardList },
  ];

  const hrExpertNav = [
    { title: t('sidebar.hrDashboard'), url: '/hr-portal', icon: LayoutDashboard },
    { title: t('sidebar.reviewQueue'), url: '/hr-portal/reviews', icon: ClipboardList },
    { title: t('sidebar.interviews'), url: '/hr-portal/interviews', icon: Calendar },
    { title: t('sidebar.availability'), url: '/hr-portal/availability', icon: Calendar },
    { title: t('sidebar.myRatings'), url: '/hr-portal/ratings', icon: Star },
    { title: t('sidebar.myProfile'), url: '/hr-portal/profile', icon: Users },
    { title: t('sidebar.jobListings'), url: '/hr-portal/jobs', icon: Briefcase },
    { title: t('sidebar.messages'), url: '/messages', icon: MessageSquare },
    { title: t('sidebar.blog'), url: '/blog', icon: BookOpen },
  ];

  const adminNav = [
    { title: t('sidebar.overview'), url: '/admin', icon: LayoutDashboard },
    { title: t('sidebar.users'), url: '/admin/users', icon: Users },
    { title: t('sidebar.myResumes'), url: '/admin/resumes', icon: FileText },
    { title: t('sidebar.templates'), url: '/admin/templates', icon: Palette },
    { title: t('sidebar.payments'), url: '/admin/payments', icon: CreditCard },
    { title: t('sidebar.aiUsage'), url: '/admin/ai-usage', icon: Brain },
    { title: t('sidebar.revenue'), url: '/admin/revenue', icon: BarChart3 },
    { title: t('sidebar.auditLog'), url: '/admin/audit-log', icon: ScrollText },
    { title: t('sidebar.hrVerification'), url: '/admin/hr-verification', icon: UserCheck },
    { title: t('sidebar.blog'), url: '/admin/blog/new', icon: BookOpen },
  ];

  const navItems = isAdmin ? adminNav : isHr ? hrExpertNav : jobSeekerNav;

  return (
    <header className="sticky top-0 z-50 h-14 flex items-center justify-between border-b bg-card px-4 gap-2">
      {/* Left: Logo */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-display text-sm font-bold text-foreground hidden sm:inline">CareerBoost</span>
      </div>

      {/* Center: Nav items */}
      <nav className="flex-1 flex items-center justify-center gap-0.5 overflow-x-auto scrollbar-hide mx-2">
        {navItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors whitespace-nowrap"
            activeClassName="bg-accent text-accent-foreground"
          >
            <item.icon className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">{item.title}</span>
          </NavLink>
        ))}
      </nav>

      {/* Right: Language, Theme, Messages, Notifications, Profile */}
      <div className="flex items-center gap-1.5 shrink-0">
        <LanguageSwitcher />
        <ThemeToggle />

        {/* ── Messages panel ── */}
        <MessagesPanel />

        {/* ── Notifications bell ── */}
        <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-[10px] text-primary-foreground font-bold flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <p className="text-sm font-semibold">{t('header.notifications')}</p>
              {unreadCount > 0 && (
                <button onClick={handleMarkAll} className="text-xs text-primary hover:underline">
                  {t('header.markAllRead')}
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  <Bell className="h-6 w-6 mx-auto mb-2 opacity-30" />
                  {t('header.noNotifications')}
                </div>
              ) : (
                notifications.slice(0, 8).map(n => (
                  <button
                    key={n.id}
                    onClick={() => handleNotifClick(n)}
                    className={`w-full text-left px-4 py-3 hover:bg-accent/50 transition-colors border-b last:border-0 flex gap-3 ${!n.isRead ? 'bg-primary/5' : ''}`}
                  >
                    {!n.isRead && <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                    <div className={`flex-1 min-w-0 ${n.isRead ? 'pl-5' : ''}`}>
                      <p className="text-xs font-semibold truncate">{n.title}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* ── Profile dropdown ── */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 px-2 rounded-full hover:bg-accent/60">
              <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                {profile?.avatarUrl && <AvatarImage src={resolveMediaUrl(profile.avatarUrl)} alt={profile.fullName ?? ''} />}
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary-dark text-primary-foreground text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden md:inline">{profile?.fullName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-0 rounded-xl overflow-hidden">
            {/* Profile header with gradient */}
            <div className="bg-gradient-to-br from-primary/10 via-accent/30 to-transparent px-4 py-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-11 w-11 ring-2 ring-primary/20 shadow-md">
                  {profile?.avatarUrl && <AvatarImage src={resolveMediaUrl(profile.avatarUrl)} alt={profile.fullName ?? ''} />}
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary-dark text-primary-foreground text-sm font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{profile?.fullName}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{profile?.email}</p>
                </div>
              </div>
            </div>

            {/* Quick links */}
            {isJobseeker && (
              <div className="p-1.5">
                {jobSeekerProfileItems.map((item) => (
                  <DropdownMenuItem
                    key={item.url}
                    onClick={() => navigate(item.url)}
                    className="rounded-lg px-3 py-2.5 cursor-pointer"
                  >
                    <div className="h-7 w-7 rounded-md bg-accent flex items-center justify-center mr-2.5 shrink-0">
                      <item.icon className="h-3.5 w-3.5 text-accent-foreground" />
                    </div>
                    <span className="text-sm">{item.title}</span>
                  </DropdownMenuItem>
                ))}
              </div>
            )}
            {isJobseeker && <DropdownMenuSeparator className="my-0" />}

            <div className="p-1.5">
              <DropdownMenuItem
                onClick={() => navigate('/notifications')}
                className="rounded-lg px-3 py-2.5 cursor-pointer"
              >
                <div className="h-7 w-7 rounded-md bg-accent flex items-center justify-center mr-2.5 shrink-0">
                  <Bell className="h-3.5 w-3.5 text-accent-foreground" />
                </div>
                <span className="text-sm">{t('sidebar.notifications')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate('/settings/profile')}
                className="rounded-lg px-3 py-2.5 cursor-pointer"
              >
                <div className="h-7 w-7 rounded-md bg-accent flex items-center justify-center mr-2.5 shrink-0">
                  <Settings className="h-3.5 w-3.5 text-accent-foreground" />
                </div>
                <span className="text-sm">{t('sidebar.settings')}</span>
              </DropdownMenuItem>
            </div>

            <DropdownMenuSeparator className="my-0" />
            <div className="p-1.5">
              <DropdownMenuItem
                onClick={handleLogout}
                className="rounded-lg px-3 py-2.5 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <div className="h-7 w-7 rounded-md bg-destructive/10 flex items-center justify-center mr-2.5 shrink-0">
                  <LogOut className="h-3.5 w-3.5 text-destructive" />
                </div>
                <span className="text-sm">{t('header.logout') || 'Logout'}</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
