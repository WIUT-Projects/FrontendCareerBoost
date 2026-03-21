import { PlaceholderPage } from '@/components/shared/PlaceholderPage';
import { AiPageWrapper } from '@/components/shared/AiPageWrapper';
import { FileText, Palette, Brain, Users, Calendar, Briefcase, BookOpen, MessageSquare, Bell, Settings, Shield, Star, ClipboardList, BarChart3, CreditCard, UserCheck, ScrollText } from 'lucide-react';

// JobSeeker pages
export const ResumesPage = () => <PlaceholderPage icon={FileText} title="My Resumes" description="Create, manage, and track all your professional resumes in one place." />;
export const ResumeNewPage = () => <PlaceholderPage icon={FileText} title="Create Resume" description="Start building a new resume with our guided wizard." />;
export const ResumeEditPage = () => <PlaceholderPage icon={FileText} title="Resume Editor" description="Edit your resume with the 3-panel editor: sections, form, and live preview." />;
export const ResumePreviewPage = () => <PlaceholderPage icon={FileText} title="Resume Preview" description="Full preview of your resume as it will appear to employers." />;
export const ResumeAnalysisPage = () => <AiPageWrapper><PlaceholderPage icon={Brain} title="AI Analysis Results" description="View AI-powered analysis scores and improvement suggestions." /></AiPageWrapper>;
export const TemplatesPage = () => <PlaceholderPage icon={Palette} title="Template Marketplace" description="Browse and apply professional resume templates." />;
export const TemplateDetailPage = () => <PlaceholderPage icon={Palette} title="Template Detail" description="Preview this template and apply it to your resume." />;
export const AiAnalysisPage = () => <AiPageWrapper><PlaceholderPage icon={Brain} title="AI Analysis" description="Run AI-powered analysis on your resumes to improve your chances." /></AiPageWrapper>;
export const HrDirectoryPage = () => <PlaceholderPage icon={Users} title="HR Expert Directory" description="Discover verified HR professionals for resume reviews and coaching." />;
export const HrProfilePage = () => <PlaceholderPage icon={Users} title="HR Expert Profile" description="View this expert's full profile, ratings, and availability." />;
export const HrBookPage = () => <PlaceholderPage icon={Calendar} title="Book Interview" description="Select a time slot and book your session with this HR expert." />;
export const InterviewsPage = () => <PlaceholderPage icon={Calendar} title="My Interviews" description="View all your past and upcoming interview sessions." />;
export const InterviewDetailPage = () => <PlaceholderPage icon={Calendar} title="Interview Detail" description="Full details about this interview session." />;
export const JobsPage = () => <PlaceholderPage icon={Briefcase} title="Job Listings" description="Browse and search active job listings matching your profile." />;
export const JobDetailPage = () => <PlaceholderPage icon={Briefcase} title="Job Detail" description="Full job description, requirements, and application form." />;
export const SavedJobsPage = () => <PlaceholderPage icon={Briefcase} title="Saved Jobs" description="Jobs you've saved for later." />;
export const ApplicationsPage = () => <PlaceholderPage icon={Briefcase} title="My Applications" description="Track all your job applications and their status." />;
export { default as BlogPage } from './Blog';
export { default as ArticlePage } from './Article';
export const InboxPage = () => <PlaceholderPage icon={MessageSquare} title="Messages" description="Your conversations with HR experts and recruiters." />;
export const ChatPage = () => <PlaceholderPage icon={MessageSquare} title="Chat" description="Real-time messaging with your contact." />;
export const NotificationsPage = () => <PlaceholderPage icon={Bell} title="Notifications" description="All your platform notifications and updates." />;

// Settings pages
export const ProfileSettingsPage = () => <PlaceholderPage icon={Settings} title="Profile Settings" description="Update your personal information and preferences." />;
export { default as SubscriptionPage } from './Subscription';
export const BillingPage = () => <PlaceholderPage icon={CreditCard} title="Billing History" description="View your payment history and download receipts." />;
export const DangerZonePage = () => <PlaceholderPage icon={Shield} title="Danger Zone" description="Delete your account or revoke OAuth permissions." />;

// HR Portal pages
export const HrPortalDashboard = () => <PlaceholderPage icon={ClipboardList} title="HR Dashboard" description="Overview of your pending reviews, upcoming interviews, and earnings." />;
export const HrReviewsPage = () => <PlaceholderPage icon={ClipboardList} title="Review Queue" description="Manage all incoming resume review requests." />;
export const HrReviewDetailPage = () => <PlaceholderPage icon={ClipboardList} title="Review Resume" description="Read the resume, write feedback, and assign scores." />;
export const HrAvailabilityPage = () => <PlaceholderPage icon={Calendar} title="Manage Availability" description="Set your weekly availability for interview bookings." />;
export const HrProfileEditPage = () => <PlaceholderPage icon={Users} title="HR Profile Editor" description="Edit your public profile, specializations, and photo." />;
export const HrRatingsPage = () => <PlaceholderPage icon={Star} title="My Ratings" description="View all ratings and feedback from your clients." />;
export const HrJobListingsPage = () => <PlaceholderPage icon={Briefcase} title="My Job Listings" description="Manage job listings you've posted." />;
export const HrApplicantsPage = () => <PlaceholderPage icon={Users} title="Applicant Pipeline" description="Review applicants for your job listings." />;

// Admin pages
export const AdminDashboard = () => <PlaceholderPage icon={BarChart3} title="Admin Overview" description="Platform revenue, user growth, and AI cost KPIs." />;
export const AdminUsersPage = () => <PlaceholderPage icon={Users} title="User Management" description="Browse, search, and manage all platform users." />;
export const AdminResumesPage = () => <PlaceholderPage icon={FileText} title="Resume Moderation" description="Review and moderate all resumes on the platform." />;
export const AdminTemplatesPage = () => <PlaceholderPage icon={Palette} title="Template Management" description="Approve, activate, and manage resume templates." />;
export const AdminPaymentsPage = () => <PlaceholderPage icon={CreditCard} title="Payment Management" description="View all payments and issue refunds." />;
export const AdminAiUsagePage = () => <AiPageWrapper><PlaceholderPage icon={Brain} title="AI Usage Logs" description="AI token usage and cost breakdown by model." /></AiPageWrapper>;
export const AdminRevenuePage = () => <PlaceholderPage icon={BarChart3} title="Revenue Snapshots" description="Daily revenue charts, tables, and CSV export." />;
export const AdminAuditLogPage = () => <PlaceholderPage icon={ScrollText} title="Audit Log" description="Full audit log of all admin actions." />;
export const AdminHrVerificationPage = () => <PlaceholderPage icon={UserCheck} title="HR Verification" description="Review and verify HR Expert applications." />;
export { default as AdminBlogNewPage } from './AdminBlogNew';
export { default as AdminBlogEditPage } from './AdminBlogEdit';

// Error pages
export const ForbiddenPage = () => <PlaceholderPage icon={Shield} title="403 — Forbidden" description="You don't have permission to access this page." />;
