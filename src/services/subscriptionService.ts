import { loadSession } from './authService';

const API_URL = import.meta.env.VITE_API_URL;
const PLANS_PATH = import.meta.env.VITE_API_SUBSCRIPTION_PLANS;

export enum SubscriptionPlanType {
  Free = 0,
  Pro = 1,
  Business = 2,
}

function authHeaders() {
  const session = loadSession();
  return {
    'Content-Type': 'application/json',
    ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
  };
}

export interface SubscriptionPlanDto {
  id: number;
  name: string;
  priceUzs: number;
  displayOrder: number;
  resumeDownloadsLimit: number;
  interviewBookingsLimit: number;
  jobApplicationsLimit: number;
  aiAnalysisEnabled: boolean;
  hrReviewEnabled: boolean;
}

export async function getSubscriptionPlans(): Promise<SubscriptionPlanDto[]> {
  const res = await fetch(`${API_URL}${PLANS_PATH}`);
  if (!res.ok) throw new Error('Failed to fetch subscription plans');
  const data = await res.json() as { items: SubscriptionPlanDto[] };
  return data.items;
}

export interface SubscriptionStatus {
  planType: SubscriptionPlanType;
  aiAnalysisEnabled: boolean;
  hrReviewEnabled: boolean;
  freeTemplatesLimit: number; // 1 for free plan; 0 = unlimited
  freeTemplatesUsed: number;
  hasActivePlan: boolean;
  expiresAt: string | null;
}

export async function getMySubscriptionStatus(): Promise<SubscriptionStatus> {
  const res = await fetch(`${API_URL}${PLANS_PATH}/my-status`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch subscription status');
  return res.json();
}
