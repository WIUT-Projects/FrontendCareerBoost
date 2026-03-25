import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { submitFeedback } from '@/services/feedbackService';
import { useAuth } from '@/contexts/AuthContext';

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
  bookingId: number;
  hrExpertName: string;
  onSubmitted: () => void;
}

export function FeedbackModal({ open, onClose, bookingId, hrExpertName, onSubmitted }: FeedbackModalProps) {
  const { session } = useAuth();
  const [score, setScore] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!session || score === 0) return;
    setLoading(true);
    try {
      await submitFeedback(session.access_token, bookingId, score, comment || undefined);
      toast.success('Feedback submitted!');
      onSubmitted();
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Rate your session</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <p className="text-sm text-muted-foreground">
            How was your session with <span className="font-medium text-foreground">{hrExpertName}</span>?
          </p>

          {/* Star rating */}
          <div className="flex gap-1 justify-center py-2">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setScore(star)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={`h-8 w-8 transition-colors ${
                    star <= (hovered || score)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-muted-foreground/30'
                  }`}
                />
              </button>
            ))}
          </div>

          {score > 0 && (
            <p className="text-center text-sm font-medium text-muted-foreground">
              {['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent!'][score]}
            </p>
          )}

          <Textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Add a comment (optional)"
            className="resize-none"
            rows={3}
            maxLength={500}
          />

          <div className="flex gap-2 justify-end pt-1">
            <Button variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={score === 0 || loading}>
              {loading ? 'Submitting…' : 'Submit'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
