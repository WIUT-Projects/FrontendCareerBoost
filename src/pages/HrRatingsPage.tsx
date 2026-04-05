import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { getHrRatings, type HrRatingItem } from '@/services/hrExpertService';
import { Star, Loader2, MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

function StarRow({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <Star
          key={n}
          className={`h-4 w-4 ${n <= score ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`}
        />
      ))}
    </div>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function RatingCard({ r }: { r: HrRatingItem }) {
  const initials = r.reviewerName
    ? r.reviewerName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{r.reviewerName ?? 'Anonymous'}</p>
            <p className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</p>
          </div>
        </div>
        <StarRow score={r.score} />
      </div>
      {r.comment && (
        <p className="text-sm text-muted-foreground leading-relaxed">{r.comment}</p>
      )}
    </div>
  );
}

export default function HrRatingsPage() {
  const { profile } = useAuth();
  const hrId = Number(profile?.id);

  const { data: ratings, isLoading, isError } = useQuery({
    queryKey: ['hr-ratings', hrId],
    queryFn: () => getHrRatings(hrId),
    enabled: !!hrId,
  });

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-destructive text-sm">Failed to load ratings.</p>
      </div>
    );
  }

  const list = ratings ?? [];
  const avg = list.length > 0
    ? (list.reduce((s, r) => s + r.score, 0) / list.length).toFixed(1)
    : null;

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <div className="flex-shrink-0 border-b bg-background px-6 py-4 flex items-center gap-3">
        <Star className="h-5 w-5 text-yellow-400" />
        <h1 className="text-xl font-bold">My Ratings</h1>
        {avg && (
          <div className="ml-auto flex items-center gap-2 text-sm">
            <span className="font-bold text-lg">{avg}</span>
            <StarRow score={Math.round(Number(avg))} />
            <span className="text-muted-foreground">({list.length})</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
            <MessageSquare className="h-10 w-10 opacity-30" />
            <p className="text-sm">No ratings yet. Complete sessions to receive feedback.</p>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-3">
            {list.map(r => <RatingCard key={r.id} r={r} />)}
          </div>
        )}
      </div>
    </div>
  );
}
