import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Search, Star, ShieldCheck, Briefcase, Clock,
  ChevronLeft, ChevronRight, MessageSquare, CalendarPlus,
} from 'lucide-react';
import {
  getHrExperts, getSpecializationChips, formatPrice,
  type HrExpertItem,
} from '@/services/hrExpertService';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const PAGE_SIZE = 12;

const SPECIALIZATION_FILTERS = [
  'All', 'IT', 'Finance', 'Management', 'Marketing', 'Design', 'Sales', 'HR',
];

// ─── Rating stars ─────────────────────────────────────────────────────────────

function Stars({ rating }: { rating: number | null }) {
  const r = rating ?? 0;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} className={cn('h-3.5 w-3.5', i <= Math.round(r) ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted')} viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.168c.969 0 1.371 1.24.588 1.81l-3.375 2.452a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.375-2.452a1 1 0 00-1.175 0l-3.375 2.452c-.784.57-1.838-.196-1.539-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.168a1 1 0 00.95-.69L9.05 2.927z" />
        </svg>
      ))}
      {rating && <span className="text-xs text-muted-foreground ml-1">{r.toFixed(1)}</span>}
    </div>
  );
}

// ─── HR Expert Card ────────────────────────────────────────────────────────────

function HrCard({ expert }: { expert: HrExpertItem }) {
  const navigate = useNavigate();
  const chips = getSpecializationChips(expert.specializations);

  const initials = expert.fullName
    ? expert.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'HR';

  return (
    <div
      className="group bg-card border rounded-2xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col"
      onClick={() => navigate(`/hr/${expert.id}`)}
    >
      {/* Top gradient accent */}
      <div className="h-1.5 w-full bg-gradient-to-r from-primary via-primary/70 to-primary/30" />

      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* Avatar + name + verified */}
        <div className="flex items-start gap-3">
          <Avatar className="h-14 w-14 ring-2 ring-primary/10 shrink-0">
            {expert.avatarUrl && <AvatarImage src={expert.avatarUrl} alt={expert.fullName ?? ''} />}
            <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary/40 text-primary-foreground font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-semibold text-sm truncate">{expert.fullName ?? 'HR Expert'}</h3>
              {expert.isVerified && (
                <ShieldCheck className="h-4 w-4 text-primary shrink-0" title="Verified" />
              )}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
              {expert.headline ?? 'HR Professional'}
            </p>
          </div>
        </div>

        {/* Rating + reviews */}
        <div className="flex items-center justify-between">
          <Stars rating={expert.avgRating} />
          <span className="text-xs text-muted-foreground">{expert.totalReviews} reviews</span>
        </div>

        {/* Specialization chips */}
        {chips.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {chips.slice(0, 4).map(c => (
              <Badge key={c} variant="secondary" className="text-[10px] rounded-full px-2 py-0.5 font-normal">
                {c}
              </Badge>
            ))}
            {chips.length > 4 && (
              <Badge variant="outline" className="text-[10px] rounded-full px-2 py-0.5 font-normal text-muted-foreground">
                +{chips.length - 4}
              </Badge>
            )}
          </div>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-auto">
          {expert.yearsExp != null && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />{expert.yearsExp} yrs
            </span>
          )}
          <span className="flex items-center gap-1 ml-auto font-medium text-foreground">
            <Briefcase className="h-3.5 w-3.5 text-primary" />
            {formatPrice(expert.reviewPriceUzs)}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="px-5 pb-4 grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs"
          onClick={e => { e.stopPropagation(); navigate(`/messages/${expert.id}`); }}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Message
        </Button>
        <Button
          size="sm"
          className="gap-1.5 text-xs"
          onClick={e => { e.stopPropagation(); navigate(`/hr/${expert.id}`); }}
        >
          <CalendarPlus className="h-3.5 w-3.5" />
          Book
        </Button>
      </div>
    </div>
  );
}

// ─── Skeleton card ────────────────────────────────────────────────────────────

function HrCardSkeleton() {
  return (
    <div className="bg-card border rounded-2xl overflow-hidden">
      <div className="h-1.5 w-full bg-muted" />
      <div className="p-5 space-y-4">
        <div className="flex items-start gap-3">
          <Skeleton className="h-14 w-14 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
        <Skeleton className="h-3 w-28" />
        <div className="flex gap-1">
          <Skeleton className="h-5 w-12 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-10 rounded-full" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-8 rounded-lg" />
          <Skeleton className="h-8 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function HrDirectoryPage() {
  const { t } = useTranslation();

  const [experts,       setExperts]       = useState<HrExpertItem[]>([]);
  const [totalCount,    setTotalCount]    = useState(0);
  const [pageIndex,     setPageIndex]     = useState(1);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState('');
  const [activeSearch,  setActiveSearch]  = useState('');
  const [specialFilter, setSpecialFilter] = useState('All');

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const load = useCallback(() => {
    setLoading(true);
    getHrExperts({
      search:         activeSearch || undefined,
      specialization: specialFilter === 'All' ? undefined : specialFilter,
      pageIndex,
      pageSize: PAGE_SIZE,
    })
      .then(res => {
        setExperts(res.items);
        setTotalCount(res.totalCount);
      })
      .catch(() => toast.error('Failed to load HR experts'))
      .finally(() => setLoading(false));
  }, [activeSearch, specialFilter, pageIndex]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = () => {
    setActiveSearch(search);
    setPageIndex(1);
  };

  const handleSpecial = (s: string) => {
    setSpecialFilter(s);
    setPageIndex(1);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold font-display">HR Expert Directory</h1>
          <p className="text-muted-foreground text-sm">
            Find verified HR professionals for resume reviews, interview coaching, and career guidance.
          </p>
        </div>

        {/* Search bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or title..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="pl-9"
            />
          </div>
          <Button onClick={handleSearch}>Search</Button>
        </div>

        {/* Specialization filters */}
        <div className="flex flex-wrap gap-2">
          {SPECIALIZATION_FILTERS.map(s => (
            <button
              key={s}
              onClick={() => handleSpecial(s)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium transition-colors border',
                specialFilter === s
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-transparent text-muted-foreground border-border hover:border-primary/50 hover:text-foreground',
              )}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-sm text-muted-foreground">
            {totalCount} expert{totalCount !== 1 ? 's' : ''} found
          </p>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: PAGE_SIZE }).map((_, i) => <HrCardSkeleton key={i} />)
            : experts.length > 0
              ? experts.map(e => <HrCard key={e.id} expert={e} />)
              : (
                <div className="col-span-full py-20 text-center text-muted-foreground">
                  <ShieldCheck className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No HR experts found</p>
                  <p className="text-sm mt-1">Try a different search or specialization.</p>
                </div>
              )
          }
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <Button
              variant="outline" size="icon"
              disabled={pageIndex <= 1}
              onClick={() => setPageIndex(p => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - pageIndex) <= 1)
              .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                if (idx > 0 && (arr[idx - 1] as number) + 1 < p) acc.push('...');
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === '...'
                  ? <span key={`dots-${i}`} className="px-1 text-muted-foreground text-sm">…</span>
                  : (
                    <Button
                      key={p}
                      variant={p === pageIndex ? 'default' : 'outline'}
                      size="icon"
                      className="w-9 h-9"
                      onClick={() => setPageIndex(p as number)}
                    >
                      {p}
                    </Button>
                  )
              )
            }
            <Button
              variant="outline" size="icon"
              disabled={pageIndex >= totalPages}
              onClick={() => setPageIndex(p => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}
