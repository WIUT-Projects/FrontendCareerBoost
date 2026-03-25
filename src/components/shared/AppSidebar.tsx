import {
  LayoutDashboard, FileText, Palette, Brain, Users, Briefcase,
  MessageSquare, Bell, Settings, BookOpen, Calendar,
  Star, ClipboardList, BarChart3, CreditCard, UserCheck, ScrollText,
  LogOut, ChevronUp, Sparkles, MessageSquareWarning,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarFooter, useSidebar,
} from '@/components/ui/sidebar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { resolveMediaUrl } from '@/lib/utils';

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { profile, signOut } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut();
    navigate('/');
  };

  // Jobseeker nav - grouped
  const jobSeekerCareer = [
    { title: t('sidebar.dashboard'), url: '/dashboard', icon: LayoutDashboard },
    { title: t('sidebar.myResumes'), url: '/resumes', icon: FileText },
    { title: t('sidebar.templates'), url: '/templates', icon: Palette },
    { title: t('sidebar.jobs'), url: '/jobs', icon: Briefcase },
  ];

  const jobSeekerAI = [
    { title: t('sidebar.aiAnalysis'), url: '/ai-analysis', icon: Brain },
    { title: t('sidebar.interviews'), url: '/interviews', icon: Calendar },
    { title: t('sidebar.hrExperts'), url: '/hr', icon: Users },
  ];

  const jobSeekerConnect = [
    { title: t('sidebar.blog'), url: '/blog', icon: BookOpen },
    { title: t('sidebar.messages'), url: '/messages', icon: MessageSquare },
  ];

  const hrExpertNav = [
    { title: t('sidebar.hrDashboard'), url: '/hr-portal', icon: LayoutDashboard },
    { title: t('sidebar.reviewQueue'), url: '/hr-portal/reviews', icon: ClipboardList },
    { title: t('sidebar.availability'), url: '/hr-portal/availability', icon: Calendar },
    { title: t('sidebar.myRatings'), url: '/hr-portal/ratings', icon: Star },
    { title: t('sidebar.myProfile'), url: '/hr-portal/profile', icon: Users },
    { title: t('sidebar.jobListings'), url: '/hr-portal/jobs', icon: Briefcase },
    { title: t('sidebar.applicants'), url: '/hr-portal/applicants', icon: Users },
    { title: t('sidebar.blog'), url: '/blog', icon: BookOpen },
  ];

  const adminNav = [
    { title: t('sidebar.overview'),        url: '/admin',                 icon: LayoutDashboard },
    { title: t('sidebar.users'),           url: '/admin/users',           icon: Users           },
    { title: t('sidebar.templates'),       url: '/admin/templates',       icon: Palette         },
    { title: t('sidebar.complaints'),       url: '/admin/reports',         icon: MessageSquareWarning },
    { title: t('sidebar.payments'),        url: '/admin/payments',        icon: CreditCard      },
    { title: t('sidebar.aiUsage'),         url: '/admin/ai-usage',        icon: Brain           },
    { title: t('sidebar.revenue'),         url: '/admin/revenue',         icon: BarChart3       },
    { title: t('sidebar.auditLog'),        url: '/admin/audit-log',       icon: ScrollText      },
    { title: t('sidebar.hrVerification'), url: '/admin/hr-verification',  icon: UserCheck       },
    { title: t('sidebar.jobs'),            url: '/admin/jobs',            icon: Briefcase       },
    { title: t('sidebar.blog'),            url: '/admin/blog',            icon: BookOpen        },
  ];

  const isJobseeker = !profile?.role || profile.role === 'jobseeker';
  const isHr = profile?.role === 'hr_expert';
  const isAdmin = profile?.role === 'admin';

  const initials = profile?.fullName
    ? profile.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const renderNavItems = (items: typeof adminNav) => (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.url}>
          <SidebarMenuButton asChild>
            <NavLink to={item.url} className="hover:bg-accent/50" activeClassName="bg-accent text-accent-foreground font-medium">
              <item.icon className="mr-2 h-4 w-4" />
              {!collapsed && <span>{item.title}</span>}
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {/* Logo */}
        <div className={collapsed ? "flex items-center justify-center py-4" : "px-4 py-5"}>
          {collapsed ? (
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-display text-base font-bold text-foreground">CareerBoost</h2>
                <p className="text-[10px] text-muted-foreground leading-none">Pro Platform</p>
              </div>
            </div>
          )}
        </div>

        {isJobseeker && (
          <>
            <SidebarGroup>
              <SidebarGroupLabel>{t('sidebar.careerBoost')}</SidebarGroupLabel>
              <SidebarGroupContent>{renderNavItems(jobSeekerCareer)}</SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>AI & {t('sidebar.hrExperts')}</SidebarGroupLabel>
              <SidebarGroupContent>{renderNavItems(jobSeekerAI)}</SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>{t('sidebar.account')}</SidebarGroupLabel>
              <SidebarGroupContent>{renderNavItems(jobSeekerConnect)}</SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        {isHr && (
          <SidebarGroup>
            <SidebarGroupLabel>{t('sidebar.hrPortal')}</SidebarGroupLabel>
            <SidebarGroupContent>{renderNavItems(hrExpertNav)}</SidebarGroupContent>
          </SidebarGroup>
        )}

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>{t('sidebar.adminPanel')}</SidebarGroupLabel>
            <SidebarGroupContent>{renderNavItems(adminNav)}</SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* Profile command at bottom */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full">
                  <Avatar className="h-7 w-7">
                    {profile?.avatarUrl && <AvatarImage src={resolveMediaUrl(profile.avatarUrl)} alt={profile.fullName ?? ''} />}
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  {!collapsed && (
                    <div className="flex-1 text-left ml-1">
                      <p className="text-sm font-medium truncate">{profile?.fullName}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{profile?.email}</p>
                    </div>
                  )}
                  {!collapsed && <ChevronUp className="h-4 w-4 text-muted-foreground" />}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <p className="text-sm font-medium">{profile?.fullName}</p>
                  <p className="text-xs text-muted-foreground">{profile?.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/notifications')}>
                  <Bell className="mr-2 h-4 w-4" />
                  {t('sidebar.notifications')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings/profile')}>
                  <Settings className="mr-2 h-4 w-4" />
                  {t('sidebar.settings')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('header.logout') || 'Logout'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
