import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  getJobListings,
  createJobListing,
  updateJobListing,
  deleteJobListing,
  type JobListingResponse,
  type CreateJobListingRequest,
} from '@/services/jobService';
import { Plus, Pencil, Trash2, Users, Briefcase, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const STATUS_BADGE: Record<string, string> = {
  active: 'bg-green-50 text-green-700 border-green-200',
  draft: 'bg-amber-50 text-amber-700 border-amber-200',
  closed: 'bg-slate-50 text-slate-700 border-slate-200',
};

const JOB_STATUS_BY_INDEX = ['draft', 'active', 'closed'];
function normalizeJobStatus(s: string | number | null | undefined): string {
  if (s == null) return 'draft';
  if (typeof s === 'number') return JOB_STATUS_BY_INDEX[s] ?? 'draft';
  return String(s).toLowerCase();
}

const EMPLOYMENT_TYPES = ['full-time', 'part-time', 'remote', 'contract'];
const JOB_STATUSES = ['draft', 'active', 'closed'];

const EMPTY_FORM: CreateJobListingRequest = {
  title: '',
  companyName: '',
  companyLogoUrl: '',
  description: '',
  requiredSkills: '',
  location: '',
  employmentType: '',
  salaryMin: undefined,
  salaryMax: undefined,
  currency: 'USD',
  experienceYears: undefined,
  status: 'draft',
  expiresAt: '',
};

export default function HrJobListings() {
  const { session, profile } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const token = session?.access_token ?? '';
  const userId = profile?.id ? Number(profile.id) : null;

  const [jobs, setJobs] = useState<JobListingResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobListingResponse | null>(null);
  const [form, setForm] = useState<CreateJobListingRequest>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    const isAdmin = profile?.role === 'admin';
    getJobListings({ pageIndex: 1, pageSize: 100 })
      .then((res) => {
        setJobs(isAdmin ? res.items : res.items.filter((j) => j.postedBy === userId));
      })
      .catch(() => toast.error(t('myJobListings.errorLoad')))
      .finally(() => setLoading(false));
  }, [userId, profile?.role]);

  function openCreate() {
    setEditingJob(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  }

  function openEdit(job: JobListingResponse) {
    setEditingJob(job);
    setForm({
      title: job.title,
      companyName: job.companyName ?? '',
      companyLogoUrl: job.companyLogoUrl ?? '',
      description: job.description ?? '',
      requiredSkills: job.requiredSkills ?? '',
      location: job.location ?? '',
      employmentType: job.employmentType ?? '',
      salaryMin: job.salaryMin ?? undefined,
      salaryMax: job.salaryMax ?? undefined,
      currency: job.currency ?? 'USD',
      experienceYears: job.experienceYears ?? undefined,
      status: normalizeJobStatus(job.status),
      expiresAt: job.expiresAt ? job.expiresAt.slice(0, 10) : '',
    });
    setFormOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim()) { toast.error(t('myJobListings.titleRequired')); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
        companyName: form.companyName || undefined,
        companyLogoUrl: form.companyLogoUrl || undefined,
        description: form.description || undefined,
        requiredSkills: form.requiredSkills || undefined,
        location: form.location || undefined,
        employmentType: form.employmentType || undefined,
        currency: form.currency || undefined,
      };
      if (editingJob) {
        const updated = await updateJobListing(token, editingJob.id, payload);
        setJobs((prev) => prev.map((j) => (j.id === updated.id ? updated : j)));
        toast.success(t('myJobListings.successUpdated'));
      } else {
        const created = await createJobListing(token, payload);
        setJobs((prev) => [created, ...prev]);
        toast.success(t('myJobListings.successCreated'));
      }
      setFormOpen(false);
    } catch {
      toast.error(t('myJobListings.errorSave'));
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteJobListing(token, deleteId);
      setJobs((prev) => prev.filter((j) => j.id !== deleteId));
      toast.success(t('myJobListings.successDeleted'));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('myJobListings.errorHasApps');
      toast.error(msg.includes('HasApplications') ? t('myJobListings.errorHasApps') : msg);
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  function setField<K extends keyof CreateJobListingRequest>(key: K, value: CreateJobListingRequest[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex-shrink-0 border-b bg-background px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold">{t('myJobListings.pageTitle')}</h1>
          <span className="ml-1 text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">{jobs.length}</span>
        </div>
        <Button onClick={openCreate} size="sm">
          <Plus className="w-4 h-4 mr-1.5" /> {t('myJobListings.newListing')}
        </Button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p>{t('myJobListings.noListings')}</p>
            <Button variant="link" onClick={openCreate}>{t('myJobListings.createFirst')}</Button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left">
                <th className="px-4 py-2.5 font-medium text-muted-foreground w-10">#</th>
                <th className="px-4 py-2.5 font-medium text-muted-foreground">{t('myJobListings.colTitle')}</th>
                <th className="px-4 py-2.5 font-medium text-muted-foreground">{t('myJobListings.colStatus')}</th>
                <th className="px-4 py-2.5 font-medium text-muted-foreground text-right">{t('myJobListings.colApplications')}</th>
                <th className="px-4 py-2.5 font-medium text-muted-foreground">{t('myJobListings.colPosted')}</th>
                <th className="px-4 py-2.5 font-medium text-muted-foreground w-40 text-right">{t('admin.table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job, i) => (
                <tr key={job.id} className="border-b hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground text-xs">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium leading-tight">{job.title}</div>
                    {job.location && (
                      <div className="text-xs text-muted-foreground">{job.location}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_BADGE[normalizeJobStatus(job.status)] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                      {normalizeJobStatus(job.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{job.applicationsCount}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                    {format(new Date(job.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-1 items-center justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 gap-1.5 text-xs"
                        onClick={() => navigate('/jobs/manage/applicants', { state: { jobId: job.id } })}
                      >
                        <Users className="w-3.5 h-3.5" />
                        {t('myJobListings.applicants')}
                        {job.applicationsCount > 0 && (
                          <span className="ml-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold px-1.5">
                            {job.applicationsCount}
                          </span>
                        )}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(job)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteId(job.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingJob ? t('myJobListings.editTitle') : t('myJobListings.newTitle')}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2">
              <Label>{t('myJobListings.fieldTitle')}</Label>
              <Input className="mt-1" value={form.title} onChange={(e) => setField('title', e.target.value)} maxLength={300} />
            </div>
            <div>
              <Label>{t('myJobListings.fieldCompany')}</Label>
              <Input className="mt-1" value={form.companyName ?? ''} onChange={(e) => setField('companyName', e.target.value)} />
            </div>
            <div>
              <Label>{t('myJobListings.fieldLocation')}</Label>
              <Input className="mt-1" value={form.location ?? ''} onChange={(e) => setField('location', e.target.value)} />
            </div>
            <div>
              <Label>{t('myJobListings.fieldEmploymentType')}</Label>
              <Select value={form.employmentType ?? ''} onValueChange={(v) => setField('employmentType', v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder={t('myJobListings.selectType')} /></SelectTrigger>
                <SelectContent>
                  {EMPLOYMENT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('myJobListings.fieldStatus')}</Label>
              <Select value={form.status ?? 'draft'} onValueChange={(v) => setField('status', v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {JOB_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('myJobListings.fieldSalaryMin')}</Label>
              <Input className="mt-1" type="number" min={0} value={form.salaryMin ?? ''} onChange={(e) => setField('salaryMin', e.target.value ? Number(e.target.value) : undefined)} />
            </div>
            <div>
              <Label>{t('myJobListings.fieldSalaryMax')}</Label>
              <Input className="mt-1" type="number" min={0} value={form.salaryMax ?? ''} onChange={(e) => setField('salaryMax', e.target.value ? Number(e.target.value) : undefined)} />
            </div>
            <div>
              <Label>{t('myJobListings.fieldCurrency')}</Label>
              <Input className="mt-1" value={form.currency ?? ''} onChange={(e) => setField('currency', e.target.value)} placeholder="USD" />
            </div>
            <div>
              <Label>{t('myJobListings.fieldExperience')}</Label>
              <Input className="mt-1" type="number" min={0} value={form.experienceYears ?? ''} onChange={(e) => setField('experienceYears', e.target.value ? Number(e.target.value) : undefined)} />
            </div>
            <div>
              <Label>{t('myJobListings.fieldExpiresAt')}</Label>
              <Input className="mt-1" type="date" value={form.expiresAt ?? ''} onChange={(e) => setField('expiresAt', e.target.value)} />
            </div>
            <div className="col-span-2">
              <Label>{t('myJobListings.fieldSkills')}</Label>
              <Input className="mt-1" value={form.requiredSkills ?? ''} onChange={(e) => setField('requiredSkills', e.target.value)} placeholder="React, TypeScript, Node.js" />
            </div>
            <div className="col-span-2">
              <Label>{t('myJobListings.fieldDescription')}</Label>
              <Textarea className="mt-1" rows={5} value={form.description ?? ''} onChange={(e) => setField('description', e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setFormOpen(false)}>{t('myJobListings.cancel')}</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? t('myJobListings.saving') : editingJob ? t('myJobListings.update') : t('myJobListings.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('myJobListings.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('myJobListings.deleteDesc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>{t('myJobListings.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleting}>
              {deleting ? t('myJobListings.deleting') : t('myJobListings.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
