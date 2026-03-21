const API_URL = import.meta.env.VITE_API_URL;
const PLANS_PATH = import.meta.env.VITE_API_SUBSCRIPTION_PLANS;

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
