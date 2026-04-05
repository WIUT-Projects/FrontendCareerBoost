import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { AppLayout } from "@/components/shared/AppLayout";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import LandingPage from "./pages/Landing";
import LoginPage from "./pages/Login";
import AdminLoginPage from "./pages/AdminLogin";
import AuthCallbackPage from "./pages/AuthCallback";
import RegisterPage from "./pages/Register";
import DashboardPage from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import {
  ResumesPage, ResumeNewPage, ResumeEditPage, ResumePreviewPage, ResumeAnalysisPage,
  TemplatesPage, TemplateDetailPage, AiAnalysisPage,
  HrDirectoryPage, HrProfilePage, HrBookPage,
  InterviewsPage, InterviewDetailPage,
  JobsPage, JobDetailPage, SavedJobsPage, ApplicationsPage,
  BlogPage, ArticlePage,
  InboxPage, ChatPage, NotificationsPage,
  ProfileSettingsPage, SubscriptionPage, SubscriptionSuccessPage, SubscriptionCancelPage, BillingPage, DangerZonePage,
  HrBookingSuccessPage, HrBookingCancelPage,
  HrPortalDashboard, HrAvailabilityPage,
  HrProfileEditPage, HrRatingsPage, HrJobListingsPage, HrApplicantsPage, HrInterviewsPage,
  HrEarningsPage,
  AdminDashboard, AdminUsersPage, AdminResumesPage, AdminTemplatesPage,
  AdminReportsPage, AdminPaymentsPage, AdminAiUsagePage, AdminRevenuePage,
  AdminRefundsPage, AdminAuditLogPage, AdminHrVerificationPage,
  AdminBlogPage, AdminBlogNewPage, AdminBlogEditPage,
  ForbiddenPage,
} from "./pages/AllPages";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <ChatProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<ArticlePage />} />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />
              <Route path="/403" element={<ForbiddenPage />} />

              {/* JobSeeker routes */}
              <Route element={<ProtectedRoute allowedRoles={['jobseeker', 'admin']} />}>
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/resumes" element={<ResumesPage />} />
                  <Route path="/resumes/new" element={<ResumeNewPage />} />
                  <Route path="/resumes/:id/edit" element={<ResumeEditPage />} />
                  <Route path="/resumes/:id/preview" element={<ResumePreviewPage />} />
                  <Route path="/resumes/:id/analysis" element={<ResumeAnalysisPage />} />
                  <Route path="/templates" element={<TemplatesPage />} />
                  <Route path="/templates/:id" element={<TemplateDetailPage />} />
                  <Route path="/ai-analysis" element={<AiAnalysisPage />} />
                  <Route path="/hr" element={<HrDirectoryPage />} />
                  <Route path="/hr/:id" element={<HrProfilePage />} />
                  <Route path="/hr/:id/book" element={<HrBookPage />} />
                  <Route path="/interviews" element={<InterviewsPage />} />
                  <Route path="/interviews/:id" element={<InterviewDetailPage />} />
                  <Route path="/jobs" element={<JobsPage />} />
                  <Route path="/jobs/:id" element={<JobDetailPage />} />
                  <Route path="/jobs/saved" element={<SavedJobsPage />} />
                  <Route path="/jobs/applications" element={<ApplicationsPage />} />
                </Route>
              </Route>

              {/* Shared authenticated routes (all roles) */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/blog/new" element={<AdminBlogNewPage />} />
                  <Route path="/messages" element={<InboxPage />} />
                  <Route path="/messages/:userId" element={<ChatPage />} />
                  {/* Job management: any authenticated user can create & manage their own listings */}
                  <Route path="/jobs/manage" element={<HrJobListingsPage />} />
                  <Route path="/jobs/manage/applicants" element={<HrApplicantsPage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                  <Route path="/settings/profile" element={<ProfileSettingsPage />} />
                  <Route path="/settings/subscription" element={<SubscriptionPage />} />
                  <Route path="/settings/billing" element={<BillingPage />} />
                  <Route path="/settings/danger" element={<DangerZonePage />} />
                  {/* Stripe payment result pages */}
                  <Route path="/subscription/success" element={<SubscriptionSuccessPage />} />
                  <Route path="/subscription/cancel" element={<SubscriptionCancelPage />} />
                  {/* HR booking payment result pages */}
                  <Route path="/booking/success" element={<HrBookingSuccessPage />} />
                  <Route path="/booking/cancel"  element={<HrBookingCancelPage />} />
                </Route>
              </Route>

              {/* HR Portal routes */}
              <Route element={<ProtectedRoute allowedRoles={['hr_expert']} />}>
                <Route element={<AppLayout />}>
                  <Route path="/hr-portal" element={<HrPortalDashboard />} />

                  <Route path="/hr-portal/interviews" element={<HrInterviewsPage />} />
                  <Route path="/hr-portal/availability" element={<HrAvailabilityPage />} />
                  <Route path="/hr-portal/profile" element={<HrProfileEditPage />} />
                  <Route path="/hr-portal/ratings" element={<HrRatingsPage />} />
                  <Route path="/hr-portal/earnings" element={<HrEarningsPage />} />
                  <Route path="/hr-portal/jobs" element={<HrJobListingsPage />} />
                  <Route path="/hr-portal/applicants" element={<HrApplicantsPage />} />
                  <Route path="/hr-portal/jobs/:id/applicants" element={<HrApplicantsPage />} />
                </Route>
              </Route>

              {/* Admin routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route element={<AppLayout />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/users" element={<AdminUsersPage />} />
                  <Route path="/admin/resumes" element={<AdminResumesPage />} />
                  <Route path="/admin/templates" element={<AdminTemplatesPage />} />
                  <Route path="/admin/payments" element={<AdminPaymentsPage />} />
                  <Route path="/admin/refunds" element={<AdminRefundsPage />} />
                  <Route path="/admin/ai-usage" element={<AdminAiUsagePage />} />
                  <Route path="/admin/revenue" element={<AdminRevenuePage />} />
                  <Route path="/admin/audit-log" element={<AdminAuditLogPage />} />
                  <Route path="/admin/reports" element={<AdminReportsPage />} />
                  <Route path="/admin/hr-verification" element={<AdminHrVerificationPage />} />
                  <Route path="/admin/jobs" element={<HrJobListingsPage />} />
                  <Route path="/admin/blog" element={<AdminBlogPage />} />
                  <Route path="/admin/blog/new" element={<AdminBlogNewPage />} />
                  <Route path="/admin/blog/:id" element={<AdminBlogEditPage />} />
                </Route>
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
        </ChatProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
