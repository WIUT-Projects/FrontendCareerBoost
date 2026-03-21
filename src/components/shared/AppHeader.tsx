import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User, Bell, Settings, Sparkles } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';
import { NavLink } from '@/components/NavLink';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  LayoutDashboard, FileText, Palette, Brain, Users, Briefcase,
  MessageSquare, BookOpen, Calendar, Star, ClipboardList, BarChart3,
  CreditCard, UserCheck, ScrollText, ChevronDown
} from 'lucide-react';

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
    { title: t('sidebar.myResumes'), url: '/resumes', icon: FileText },
    { title: t('sidebar.messages'), url: '/messages', icon: MessageSquare },
    { title: t('sidebar.interviews'), url: '/interviews', icon: Calendar },
  ];

  const hrExpertNav = [
    { title: t('sidebar.hrDashboard'), url: '/hr-portal', icon: LayoutDashboard },
    { title: t('sidebar.reviewQueue'), url: '/hr-portal/reviews', icon: ClipboardList },
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
    <header className="h-14 flex items-center justify-between border-b bg-card px-4 gap-2">
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

      {/* Right: Language, Theme, Profile */}
      <div className="flex items-center gap-1.5 shrink-0">
        <LanguageSwitcher />
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 px-2 rounded-full hover:bg-accent/60">
              <Avatar className="h-8 w-8 ring-2 ring-primary/20">
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
