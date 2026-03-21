import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LucideIcon, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon: LucideIcon;
  showBackButton?: boolean;
}

export function PlaceholderPage({ title, description, icon: Icon, showBackButton = true }: PlaceholderPageProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div>
      {showBackButton && (
        <div className="px-4 py-4 border-b">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('common.back')}
          </Button>
        </div>
      )}
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="h-16 w-16 rounded-2xl bg-accent flex items-center justify-center mb-6">
          <Icon className="h-8 w-8 text-primary" />
        </div>
        <h1 className="font-display text-2xl font-bold mb-2">{title}</h1>
        <p className="text-muted-foreground max-w-md">{description}</p>
        <div className="mt-8 flex gap-2">
          <div className="h-2 w-24 rounded-full bg-muted animate-pulse" />
          <div className="h-2 w-16 rounded-full bg-muted animate-pulse" />
          <div className="h-2 w-20 rounded-full bg-muted animate-pulse" />
        </div>
      </div>
    </div>
  );
}
