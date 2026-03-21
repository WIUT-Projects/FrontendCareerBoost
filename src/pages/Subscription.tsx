import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Zap, ArrowRight, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TiltCard } from '@/components/shared/TiltCard';
import { useAuth } from '@/contexts/AuthContext';
import { getSubscriptionPlans, type SubscriptionPlanDto } from '@/services/subscriptionService';

function getPlanCta(planName: string, currentTier: string | undefined, t: any) {
  const tier = (currentTier ?? '').toLowerCase();
  const name = planName.toLowerCase();

  if (tier === name) return { label: t('subscription.currentPlan'), disabled: true };
  if (name === 'free') return { label: t('subscription.free'), disabled: false };
  if (name === 'pro') return { label: t('subscription.upgradeToProBtn'), disabled: false };
  return { label: t('subscription.upgradeToBusinessBtn'), disabled: false };
}

function formatPrice(priceUzs: number, t: any): string {
  if (priceUzs === 0) return t('subscription.free');
  return priceUzs.toLocaleString('uz-UZ');
}

function getFeatureKeys(plan: SubscriptionPlanDto) {
  const features: string[] = [];

  if (plan.resumeDownloadsLimit === 0) {
    features.push('resumesUnlimited');
  } else if (plan.resumeDownloadsLimit > 0) {
    features.push('resumesShort_' + plan.resumeDownloadsLimit);
  }

  if (plan.aiAnalysisEnabled) {
    if (plan.jobApplicationsLimit === 0) {
      features.push('aiAnalysesUnlimited');
    } else {
      features.push('aiAnalyses_' + plan.jobApplicationsLimit);
    }
  }

  if (plan.hrReviewEnabled) {
    if (plan.interviewBookingsLimit === 0) {
      features.push('hrReviewsUnlimited');
    } else {
      features.push('hrReviewsMonth_' + plan.interviewBookingsLimit);
    }
  }

  if (plan.name.toLowerCase() === 'free') {
    features.push('basicTemplates', 'jobSearch', 'communitySupport');
  } else if (plan.name.toLowerCase() === 'pro') {
    features.push('premiumTemplates', 'interviewPrep', 'emailSupport');
  } else if (plan.name.toLowerCase() === 'business') {
    features.push('premiumTemplates', 'analyticsBoard', 'dedicatedSupport');
  }

  return features;
}

function getTranslatedFeature(key: string, t: any, count?: number): string {
  if (key.includes('_')) {
    const [base, num] = key.split('_');
    return t(`subscription.features.${base}`, { count: num || count });
  }
  return t(`subscription.features.${key}`);
}

export function PricingSection({ embedded = false }: { embedded?: boolean }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlanDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSubscriptionPlans()
      .then(setPlans)
      .catch(() => setPlans([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={cn(!embedded && 'py-8')}>
      {!embedded && (
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl font-bold">{t('subscription.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('subscription.subtitle')}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {plans.map((plan) => {
          const popular = plan.displayOrder === 2;
          const { label, disabled } = getPlanCta(plan.name, profile?.role === 'admin' ? 'Admin' : profile?.subscriptionTier, t);
          const featureKeys = getFeatureKeys(plan);

          return (
            <TiltCard
              key={plan.id}
              className={cn(
                'relative rounded-xl border p-5 flex flex-col',
                popular
                  ? 'border-primary/40 bg-gradient-to-b from-primary/5 to-card shadow-md'
                  : 'bg-card'
              )}
            >
              {popular && (
                <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] px-2.5">
                  <Zap className="h-3 w-3 mr-1" /> {t('subscription.mostPopular')}
                </Badge>
              )}

              <div className="mb-4">
                <h3 className="font-display font-semibold text-sm">{t(`subscription.${plan.name.toLowerCase()}`)}</h3>
                <div className="flex items-baseline gap-0.5 mt-1">
                  <span className="font-display text-2xl font-bold">{formatPrice(plan.priceUzs, t)}</span>
                  {plan.priceUzs > 0 && (
                    <span className="text-xs text-muted-foreground">{t('subscription.perMonth')}</span>
                  )}
                </div>
              </div>

              <ul className="space-y-2 mb-5 flex-1 text-xs text-muted-foreground">
                {featureKeys.map((key) => (
                  <li key={key} className="flex items-start gap-2">
                    <Check className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                    <span>{getTranslatedFeature(key, t)}</span>
                  </li>
                ))}
              </ul>

              <Button
                size="sm"
                variant={popular ? 'default' : 'outline'}
                disabled={disabled}
                className="w-full rounded-lg"
                onClick={() => !disabled && navigate('/settings/billing')}
              >
                {label}
                {!disabled && <ArrowRight className="ml-1.5 h-3.5 w-3.5" />}
              </Button>
            </TiltCard>
          );
        })}
      </div>
    </div>
  );
}

const SubscriptionPage = () => {
  return (
    <div className="max-w-5xl mx-auto">
      <PricingSection />
    </div>
  );
};

export default SubscriptionPage;
