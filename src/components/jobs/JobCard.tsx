import { Link } from 'react-router-dom';
import { MapPin, Briefcase, Clock, Bookmark, BookmarkCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { JobListingResponse } from '@/services/jobService';

interface Props {
  job: JobListingResponse;
  isSaved?: boolean;
  onSave?: (jobId: number) => void;
  onUnsave?: (jobId: number) => void;
  showSaveButton?: boolean;
}

function formatSalary(job: JobListingResponse): string | null {
  if (!job.salaryMin && !job.salaryMax) return null;
  const currency = job.currency ?? 'USD';
  if (job.salaryMin && job.salaryMax) {
    return `${currency} ${job.salaryMin.toLocaleString()} – ${job.salaryMax.toLocaleString()}`;
  }
  if (job.salaryMin) return `${currency} ${job.salaryMin.toLocaleString()}+`;
  return `Up to ${currency} ${job.salaryMax!.toLocaleString()}`;
}

const STATUS_BADGE: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  draft: 'bg-yellow-100 text-yellow-700',
  closed: 'bg-gray-100 text-gray-500',
};

export function JobCard({ job, isSaved, onSave, onUnsave, showSaveButton }: Props) {
  const salary = formatSalary(job);
  const statusClass = STATUS_BADGE[job.status ?? ''] ?? 'bg-gray-100 text-gray-500';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          {/* Company Logo */}
          <div className="shrink-0 w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
            {job.companyLogoUrl ? (
              <img src={job.companyLogoUrl} alt={job.companyName ?? ''} className="w-full h-full object-cover" />
            ) : (
              <Briefcase className="w-6 h-6 text-muted-foreground" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <Link
                  to={`/jobs/${job.id}`}
                  className="font-semibold text-base hover:underline line-clamp-1"
                >
                  {job.title}
                </Link>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {job.companyName ?? job.postedByName ?? 'Unknown company'}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge className={statusClass}>{job.status ?? 'active'}</Badge>
                {showSaveButton && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => isSaved ? onUnsave?.(job.id) : onSave?.(job.id)}
                    title={isSaved ? 'Unsave job' : 'Save job'}
                  >
                    {isSaved ? (
                      <BookmarkCheck className="w-4 h-4 text-primary" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
              {job.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {job.location}
                </span>
              )}
              {job.employmentType && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {job.employmentType}
                </span>
              )}
              {salary && <span className="font-medium text-foreground">{salary}</span>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
