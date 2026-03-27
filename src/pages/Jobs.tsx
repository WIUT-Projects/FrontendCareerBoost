import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { JobCard } from '@/components/jobs/JobCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  getJobListings,
  getSavedJobs,
  saveJob,
  unsaveJob,
  type JobListingResponse,
} from '@/services/jobService';
import { Search, Plus } from 'lucide-react';
import { toast } from 'sonner';

const EMPLOYMENT_TYPES = ['full-time', 'part-time', 'remote', 'contract'];
const PAGE_SIZE = 10;

export default function Jobs() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const token = session?.access_token ?? null;

  const [jobs, setJobs] = useState<JobListingResponse[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const [loading, setLoading] = useState(true);

  const [location, setLocation] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [search, setSearch] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({ location: '', employmentType: '' });

  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());

  // Load saved job IDs if logged in
  useEffect(() => {
    if (!token) return;
    getSavedJobs(token, 1, 100)
      .then((res) => setSavedIds(new Set(res.items.map((s) => s.jobId))))
      .catch(() => {});
  }, [token]);

  // Load job listings
  useEffect(() => {
    setLoading(true);
    getJobListings({
      pageIndex,
      pageSize: PAGE_SIZE,
      status: 'active',
      location: appliedFilters.location || undefined,
      employmentType: appliedFilters.employmentType || undefined,
    })
      .then((res) => {
        setJobs(res.items);
        setTotalCount(res.totalCount);
      })
      .catch(() => toast.error('Failed to load job listings'))
      .finally(() => setLoading(false));
  }, [pageIndex, appliedFilters]);

  function applyFilters() {
    setPageIndex(1);
    setAppliedFilters({ location, employmentType });
  }

  function resetFilters() {
    setLocation('');
    setEmploymentType('');
    setPageIndex(1);
    setAppliedFilters({ location: '', employmentType: '' });
  }

  async function handleSave(jobId: number) {
    if (!token) return;
    try {
      await saveJob(token, jobId);
      setSavedIds((prev) => new Set([...prev, jobId]));
      toast.success('Job saved');
    } catch {
      toast.error('Failed to save job');
    }
  }

  async function handleUnsave(jobId: number) {
    if (!token) return;
    try {
      await unsaveJob(token, jobId);
      setSavedIds((prev) => {
        const next = new Set(prev);
        next.delete(jobId);
        return next;
      });
      toast.success('Job removed from saved');
    } catch {
      toast.error('Failed to unsave job');
    }
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const filteredJobs = search
    ? jobs.filter(
        (j) =>
          j.title.toLowerCase().includes(search.toLowerCase()) ||
          (j.companyName ?? '').toLowerCase().includes(search.toLowerCase()),
      )
    : jobs;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('jobs.pageTitle')}</h1>
        {token && (
          <Button onClick={() => navigate('/jobs/manage')}>
            <Plus className="w-4 h-4 mr-2" /> {t('jobs.postJob')}
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t('jobs.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Input
          placeholder={t('jobs.locationPlaceholder')}
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-40"
        />
        <Select value={employmentType} onValueChange={setEmploymentType}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            {EMPLOYMENT_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={applyFilters}>{t('jobs.apply')}</Button>
        {(appliedFilters.location || appliedFilters.employmentType) && (
          <Button variant="ghost" onClick={resetFilters}>
            {t('jobs.reset')}
          </Button>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        <p className="text-center text-muted-foreground py-16">{t('jobs.noResults')}</p>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            {t('jobs.found', { count: totalCount })}
          </p>
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isSaved={savedIds.has(job.id)}
                showSaveButton={!!token}
                onSave={handleSave}
                onUnsave={handleUnsave}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="outline"
                disabled={pageIndex === 1}
                onClick={() => setPageIndex((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="flex items-center text-sm text-muted-foreground px-2">
                Page {pageIndex} of {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={pageIndex >= totalPages}
                onClick={() => setPageIndex((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
