import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Sparkles } from 'lucide-react';

export function AppLayout() {
  const { profile } = useAuth();
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
