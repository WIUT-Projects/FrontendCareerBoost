import { useNavigate } from 'react-router-dom';
import { XCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SubscriptionCancelPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      {/* Icon */}
      <div className="mb-5 flex items-center justify-center w-16 h-16 rounded-full bg-muted">
        <XCircle className="h-8 w-8 text-muted-foreground" />
      </div>

      {/* Title */}
      <h1 className="font-display text-2xl font-bold mb-2">
        To'lov bekor qilindi
      </h1>

      {/* Description */}
      <p className="text-muted-foreground text-sm max-w-sm mb-8">
        Xavotir olmang — hech qanday pul yechilmadi. Xohlasangiz qayta urinib ko'rishingiz mumkin.
      </p>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={() => navigate('/settings/subscription')}
          className="rounded-lg"
        >
          <RefreshCw className="mr-1.5 h-4 w-4" />
          Qayta urinish
        </Button>
        <Button
          variant="outline"
          className="rounded-lg"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Dashboardga qaytish
        </Button>
      </div>
    </div>
  );
};

export default SubscriptionCancelPage;
