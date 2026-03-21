import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  getJobListings,
  createJobListing,
  updateJobListing,
  deleteJobListing,
  type JobListingResponse,
  type CreateJobListingRequest,
} from '@/services/jobService';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const STATUS_BADGE: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  draft: 'bg-yellow-100 text-yellow-700',
  closed: 'bg-gray-100 text-gray-500',
};

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
      .catch(() => toast.error('Failed to load job listings'))
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
      status: job.status ?? 'draft',
      expiresAt: job.expiresAt ? job.expiresAt.slice(0, 10) : '',
    });
    setFormOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
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
        toast.success('Job listing updated');
      } else {
        const created = await createJobListing(token, payload);
        setJobs((prev) => [created, ...prev]);
        toast.success('Job listing created');
      }
      setFormOpen(false);
    } catch {
      toast.error('Failed to save job listing');
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
      toast.success('Job listing deleted');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete';
      toast.error(msg.includes('HasApplications') ? 'Cannot delete: job has active applications' : msg);
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  function setField<K extends keyof CreateJobListingRequest>(key: K, value: CreateJobListingRequest[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Job Listings</h1>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" /> New Listing
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p>No job listings yet.</p>
          <Button variant="link" onClick={openCreate}>Create your first listing</Button>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applications</TableHead>
                <TableHead>Posted</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <p className="font-medium">{job.title}</p>
                    {job.location && (
                      <p className="text-xs text-muted-foreground">{job.location}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={STATUS_BADGE[job.status ?? ''] ?? 'bg-gray-100'}>
                      {job.status ?? 'draft'}
                    </Badge>
                  </TableCell>
                  <TableCell>{job.applicationsCount}</TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {format(new Date(job.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(job)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(job.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingJob ? 'Edit Job Listing' : 'New Job Listing'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2">
              <Label>Title *</Label>
              <Input className="mt-1" value={form.title} onChange={(e) => setField('title', e.target.value)} maxLength={300} />
            </div>
            <div>
              <Label>Company Name</Label>
              <Input className="mt-1" value={form.companyName ?? ''} onChange={(e) => setField('companyName', e.target.value)} />
            </div>
            <div>
              <Label>Location</Label>
              <Input className="mt-1" value={form.location ?? ''} onChange={(e) => setField('location', e.target.value)} />
            </div>
            <div>
              <Label>Employment Type</Label>
              <Select value={form.employmentType ?? ''} onValueChange={(v) => setField('employmentType', v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {EMPLOYMENT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status ?? 'draft'} onValueChange={(v) => setField('status', v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {JOB_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Salary Min</Label>
              <Input className="mt-1" type="number" min={0} value={form.salaryMin ?? ''} onChange={(e) => setField('salaryMin', e.target.value ? Number(e.target.value) : undefined)} />
            </div>
            <div>
              <Label>Salary Max</Label>
              <Input className="mt-1" type="number" min={0} value={form.salaryMax ?? ''} onChange={(e) => setField('salaryMax', e.target.value ? Number(e.target.value) : undefined)} />
            </div>
            <div>
              <Label>Currency</Label>
              <Input className="mt-1" value={form.currency ?? ''} onChange={(e) => setField('currency', e.target.value)} placeholder="USD" />
            </div>
            <div>
              <Label>Experience (years)</Label>
              <Input className="mt-1" type="number" min={0} value={form.experienceYears ?? ''} onChange={(e) => setField('experienceYears', e.target.value ? Number(e.target.value) : undefined)} />
            </div>
            <div>
              <Label>Expires At</Label>
              <Input className="mt-1" type="date" value={form.expiresAt ?? ''} onChange={(e) => setField('expiresAt', e.target.value)} />
            </div>
            <div className="col-span-2">
              <Label>Required Skills (comma-separated)</Label>
              <Input className="mt-1" value={form.requiredSkills ?? ''} onChange={(e) => setField('requiredSkills', e.target.value)} placeholder="React, TypeScript, Node.js" />
            </div>
            <div className="col-span-2">
              <Label>Description</Label>
              <Textarea className="mt-1" rows={5} value={form.description ?? ''} onChange={(e) => setField('description', e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editingJob ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job Listing</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? This action cannot be undone. Listings with active applications cannot be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
