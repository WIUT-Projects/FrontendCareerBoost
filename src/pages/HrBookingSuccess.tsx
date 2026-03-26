import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';

export default function HrBookingSuccessPage() {
  const navigate    = useNavigate();
  const queryClient = useQueryClient();

  // Invalidate bookings cache so the new booking appears immediately
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
  }, [queryClient]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      {/* Icon */}
      <div className="mb-5 flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30">
        <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
      </div>

      {/* Title */}
      <h1 className="font-display text-2xl font-bold mb-2">Booking Confirmed!</h1>

      {/* Description */}
      <p className="text-muted-foreground text-sm max-w-sm mb-1">
        Your payment was successful. The HR expert will review your booking request shortly.
      </p>
      <p className="text-muted-foreground text-xs mb-8">
        You will receive a notification once your session is approved.
      </p>

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={() => navigate('/interviews')} className="rounded-lg">
          View My Sessions
          <ArrowRight className="ml-1.5 h-4 w-4" />
        </Button>
        <Button variant="outline" className="rounded-lg" onClick={() => navigate('/hr')}>
          Back to HR Experts
        </Button>
      </div>
    </div>
  );
}
