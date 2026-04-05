import { PlaceholderPage } from '@/components/shared/PlaceholderPage';
import { AiPageWrapper } from '@/components/shared/AiPageWrapper';
import { FileText, Palette, Brain, Users, Calendar, Briefcase, BookOpen, MessageSquare, Bell, Shield, Star, ClipboardList, BarChart3, CreditCard, UserCheck, ScrollText } from 'lucide-react';

// JobSeeker pages
export { default as ResumesPage } from './ResumesPage';
export const ResumeNewPage = () => <PlaceholderPage icon={FileText} title="Create Resume" description="Start building a new resume with our guided wizard." />;
export { default as ResumeEditPage } from './ResumeEditPage';
export const ResumePreviewPage = () => <PlaceholderPage icon={FileText} title="Resume Preview" description="Full preview of your resume as it will appear to employers." />;
export const ResumeAnalysisPage = () => <AiPageWrapper><PlaceholderPage icon={Brain} title="AI Analysis Results" description="View AI-powered analysis scores and improvement suggestions." /></AiPageWrapper>;
export { default as TemplatesPage } from './TemplatesPage';
export { default as TemplateDetailPage } from './TemplateDetailPage';
export { default as AiAnalysisPage } from './AiAnalysisPage';
export { default as HrDirectoryPage } from './HrDirectoryPage';
export { default as HrProfilePage } from './HrProfilePage';
export const HrBookPage = () => <PlaceholderPage icon={Calendar} title="Book Interview" description="Select a time slot and book your session with this HR expert." />;
export { default as InterviewsPage } from './InterviewsPage';
export { default as InterviewDetailPage } from './InterviewDetailPage';
export { default as JobsPage } from './Jobs';
export { default as JobDetailPage } from './JobDetail';
export { default as SavedJobsPage } from './SavedJobs';
export { default as ApplicationsPage } from './Applications';
export { default as BlogPage } from './Blog';
export { default as ArticlePage } from './Article';
export { default as InboxPage } from './MessagesPage';
export { default as ChatPage } from './ConversationPage';
export const NotificationsPage = () => <PlaceholderPage icon={Bell} title="Notifications" description="All your platform notifications and updates." />;

// Settings pages
export { default as ProfileSettingsPage } from './ProfileSettingsPage';
export { default as SubscriptionPage } from './Subscription';
export { default as SubscriptionSuccessPage } from './SubscriptionSuccess';
export { default as SubscriptionCancelPage } from './SubscriptionCancel';
export { default as HrBookingSuccessPage } from './HrBookingSuccess';
export { default as HrBookingCancelPage  } from './HrBookingCancel';
export { default as BillingPage } from './BillingPage';
export const DangerZonePage = () => <PlaceholderPage icon={Shield} title="Danger Zone" description="Delete your account or revoke OAuth permissions." />;

// HR Portal pages
export { default as HrPortalDashboard } from './HrPortalDashboard';
export const HrReviewsPage = () => <PlaceholderPage icon={ClipboardList} title="Review Queue" description="Manage all incoming resume review requests." />;
export const HrReviewDetailPage = () => <PlaceholderPage icon={ClipboardList} title="Review Resume" description="Read the resume, write feedback, and assign scores." />;
export { default as HrAvailabilityPage } from './HrAvailabilityPage';
export const HrProfileEditPage = () => <PlaceholderPage icon={Users} title="HR Profile Editor" description="Edit your public profile, specializations, and photo." />;
export const HrRatingsPage = () => <PlaceholderPage icon={Star} title="My Ratings" description="View all ratings and feedback from your clients." />;
export { default as HrJobListingsPage } from './HrJobListings';
export { default as HrApplicantsPage } from './HrApplicants';
export { default as HrInterviewsPage } from './HrInterviewsPage';
export { default as HrEarningsPage } from './HrEarningsPage';

// Admin pages
export { default as AdminDashboard } from './admin/AdminOverviewPage';
export { default as AdminUsersPage } from './admin/AdminUsersPage';
export const AdminResumesPage = () => <PlaceholderPage icon={FileText} title="Resume Moderation" description="Review and moderate all resumes on the platform." />;
export { default as AdminTemplatesPage } from './admin/AdminTemplatesPage';
export { default as AdminReportsPage } from './admin/AdminReportsPage';
export { default as AdminPaymentsPage } from './admin/AdminPaymentsPage';
export { default as AdminAiUsagePage } from './admin/AdminAiUsagePage';
export { default as AdminRefundsPage } from './admin/AdminRefundsPage';
export const AdminRevenuePage = () => <PlaceholderPage icon={BarChart3} title="Revenue Snapshots" description="Daily revenue charts, tables, and CSV export." />;
export const AdminAuditLogPage = () => <PlaceholderPage icon={ScrollText} title="Audit Log" description="Full audit log of all admin actions." />;
export { default as AdminHrVerificationPage } from './admin/AdminHrVerificationPage';
export { default as AdminBlogPage } from './admin/AdminBlogPage';
export { default as AdminBlogNewPage } from './AdminBlogNew';
export { default as AdminBlogEditPage } from './AdminBlogEdit';

// Error pages
export const ForbiddenPage = () => <PlaceholderPage icon={Shield} title="403 — Forbidden" description="You don't have permission to access this page." />;
