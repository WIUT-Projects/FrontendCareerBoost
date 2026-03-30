import { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Briefcase, Search, Loader2, Trash2, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { getJobsAdmin, deleteJobAdmin } from '@/services/adminService';
import type { AdminJobDto } from '@/services/adminService';

// Status badge colors
const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-amber-50 text-amber-700 border-amber-200',
  active: 'bg-green-50 text-green-700 border-green-200',
  closed: 'bg-slate-50 text-slate-700 border-slate-200',
};

export default function AdminJobsPage() {
  const { t } = useTranslation();
  const [jobs, setJobs] = useState<AdminJobDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'active' | 'closed'>('all');
  const [deleting, setDeleting] = useState<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const PAGE_SIZE = 15;

  // Debounce search input (300 ms)
  const handleSearchChange = (value: string) => {
    setSearch(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 300);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getJobsAdmin(page, PAGE_SIZE, debouncedSearch || undefined, statusFilter !== 'all' ? statusFilter : undefined);
      setJobs(data.items ?? []);
      setTotal(data.totalCount ?? 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, statusFilter]);

  useEffect(() => { load(); }, [load]);

  // Status filter resets to page 1
  const handleStatusFilterChange = (v: typeof statusFilter) => {
    setStatusFilter(v);
    setPage(1);
  };

  const handleDelete = async (id: number) => {
    setDeleting(id);
    try {
      await deleteJobAdmin(id);
      setJobs((prev) => prev.filter((j) => j.id !== id));
      setTotal((t) => t - 1);
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(null);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex-shrink-0 border-b bg-background px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold">{t('admin.jobs.title')}</h1>
          <span className="ml-1 text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">{total}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex-shrink-0 border-b bg-muted/30 px-6 py-2.5 flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder={t('admin.jobs.searchPlaceholder')}
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => handleStatusFilterChange(v as typeof statusFilter)}>
          <SelectTrigger className="w-36 h-8 text-sm">
            <SelectValue placeholder={t('admin.jobs.allStatuses')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('admin.jobs.allStatuses')}</SelectItem>
            <SelectItem value="draft">{t('admin.jobs.status.draft')}</SelectItem>
            <SelectItem value="active">{t('admin.jobs.status.active')}</SelectItem>
            <SelectItem value="closed">{t('admin.jobs.status.closed')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left">
                <th className="px-4 py-2.5 font-medium text-muted-foreground w-10">#</th>
                <th className="px-4 py-2.5 font-medium text-muted-foreground">{t('admin.jobs.table.title')}</th>
                <th className="px-4 py-2.5 font-medium text-muted-foreground">{t('admin.jobs.table.postedBy')}</th>
                <th className="px-4 py-2.5 font-medium text-muted-foreground">{t('admin.jobs.table.status')}</th>
                <th className="px-4 py-2.5 font-medium text-muted-foreground text-right">{t('admin.jobs.table.views')}</th>
                <th className="px-4 py-2.5 font-medium text-muted-foreground text-right">{t('admin.jobs.table.applications')}</th>
                <th className="px-4 py-2.5 font-medium text-muted-foreground">{t('admin.jobs.table.postedDate')}</th>
                <th className="px-4 py-2.5 font-medium text-muted-foreground w-24 text-right">{t('admin.jobs.table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-muted-foreground text-sm">
                    {t('admin.jobs.noJobs')}
                  </td>
                </tr>
              ) : jobs.map((job, i) => (
                <tr key={job.id} className="border-b hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground text-xs">{(page - 1) * PAGE_SIZE + i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium leading-tight">{job.title}</div>
                    <div className="text-xs text-muted-foreground">{job.companyName ?? '—'}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{job.postedByName ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[job.status]}`}>
                      {t(`admin.jobs.status.${job.status}`)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{job.viewsCount}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{job.applicationsCount}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" disabled={deleting === job.id}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t('admin.jobs.deleteTitle')}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t('admin.jobs.deleteDesc', { title: job.title })}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('admin.cancel')}</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => handleDelete(job.id)}
                          >
                            {t('admin.delete')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex-shrink-0 border-t px-6 py-2.5 flex items-center justify-between text-sm">
          <span className="text-muted-foreground text-xs">
            {t('admin.jobs.pagination', { page, totalPages, total })}
          </span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
