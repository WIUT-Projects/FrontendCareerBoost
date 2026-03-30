import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MessageSquareWarning, Search, Filter, Loader2,
  CheckCircle2, Clock, AlertCircle, Eye, X,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

// ── Types ─────────────────────────────────────────────────────────────────────

type ComplaintStatus = 'new' | 'in_progress' | 'resolved' | 'rejected';
type ComplaintCategory = 'bug' | 'content' | 'user' | 'payment' | 'other';

interface Complaint {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  category: ComplaintCategory;
  subject: string;
  message: string;
  status: ComplaintStatus;
  createdAt: string;
  resolvedAt?: string;
}

// ── Mock data (replace with API call when backend endpoint is ready) ──────────
const MOCK_COMPLAINTS: Complaint[] = [
  { id: 1, userId: 12, userName: 'Alisher Karimov', userEmail: 'alisher@mail.com', category: 'bug', subject: 'PDF yuklab bo\'lmayapti', message: 'Resume PDF yuklab olmoqchi bo\'ldim, lekin xato chiqmoqda. Bir necha marta sinab ko\'rdim.', status: 'new', createdAt: '2026-03-20T10:30:00Z' },
  { id: 2, userId: 8,  userName: 'Nilufar Yusupova', userEmail: 'nilufar@gmail.com', category: 'payment', subject: 'To\'lov qilindim, lekin premium faollashmadi', message: 'Karta orqali to\'lov amalga oshirdim, pul chiqdi lekin premium obuna yoqilmadi.', status: 'in_progress', createdAt: '2026-03-19T15:00:00Z' },
  { id: 3, userId: 23, userName: 'Bobur Toshmatov', userEmail: 'bobur@company.uz', category: 'content', subject: 'Maqolada noto\'g\'ri ma\'lumot', message: '"Intervyu tayyorlash" maqolasida keltirilgan statistika 2020 yilga tegishli.', status: 'resolved', createdAt: '2026-03-18T09:15:00Z', resolvedAt: '2026-03-19T11:00:00Z' },
  { id: 4, userId: 5,  userName: 'Dilnoza Ergasheva', userEmail: 'dilnoza@inbox.uz', category: 'user', subject: 'Profil tasviri o\'zgarmayapti', message: 'Avatar yuklashga harakat qilyapman, 3 MB gacha JPG rasm, lekin "xato" deyapti.', status: 'new', createdAt: '2026-03-20T08:00:00Z' },
  { id: 5, userId: 31, userName: 'Jasur Nazarov', userEmail: 'jasur@tech.uz', category: 'bug', subject: 'Template preview ishlamayapti', message: 'Atlantic Blue template preview ko\'rsatmayapti, bo\'sh sahifa chiqmoqda.', status: 'rejected', createdAt: '2026-03-17T14:00:00Z' },
];

// ── Config ────────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ComplaintStatus, { label: string; icon: typeof Clock; cls: string }> = {
  new:         { label: 'New',         icon: AlertCircle,   cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  in_progress: { label: 'In Progress', icon: Clock,         cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  resolved:    { label: 'Resolved',    icon: CheckCircle2,  cls: 'bg-green-50 text-green-700 border-green-200' },
  rejected:    { label: 'Rejected',    icon: X,             cls: 'bg-rose-50 text-rose-700 border-rose-200' },
};

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AdminReportsPage() {
  const { t } = useTranslation();
  const [complaints, setComplaints] = useState<Complaint[]>(MOCK_COMPLAINTS);
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatus]   = useState<'all' | ComplaintStatus>('all');
  const [selected, setSelected]     = useState<Complaint | null>(null);

  const filtered = complaints.filter((c) => {
    const q = search.toLowerCase();
    const matchQ = !q || c.subject.toLowerCase().includes(q) || c.userName.toLowerCase().includes(q) || c.userEmail.includes(q);
    const matchS = statusFilter === 'all' || c.status === statusFilter;
    return matchQ && matchS;
  });

  const changeStatus = (id: number, status: ComplaintStatus) => {
    setComplaints((prev) =>
      prev.map((c) => c.id === id ? { ...c, status, resolvedAt: status === 'resolved' ? new Date().toISOString() : c.resolvedAt } : c),
    );
    if (selected?.id === id) setSelected((s) => s ? { ...s, status } : s);
  };

  const counts = {
    new:         complaints.filter((c) => c.status === 'new').length,
    in_progress: complaints.filter((c) => c.status === 'in_progress').length,
    resolved:    complaints.filter((c) => c.status === 'resolved').length,
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex-shrink-0 border-b px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <MessageSquareWarning className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold">{t('admin.reports.title')}</h1>
        </div>
        {/* Summary chips */}
        <div className="flex items-center gap-2 text-xs">
          <span className="bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2.5 py-0.5 font-medium">{t('admin.reports.chipNew', { n: counts.new })}</span>
          <span className="bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2.5 py-0.5 font-medium">{t('admin.reports.chipInProgress', { n: counts.in_progress })}</span>
          <span className="bg-green-50 text-green-700 border border-green-200 rounded-full px-2.5 py-0.5 font-medium">{t('admin.reports.chipResolved', { n: counts.resolved })}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex-shrink-0 border-b bg-muted/30 px-6 py-2.5 flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder={t('admin.reports.searchPlaceholder')} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-8 text-sm" />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatus(v as typeof statusFilter)}>
          <SelectTrigger className="w-36 h-8 text-sm">
            <Filter className="h-3 w-3 mr-1" />
            <SelectValue placeholder={t('admin.reports.table.status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('admin.reports.allStatuses')}</SelectItem>
            <SelectItem value="new">{t('admin.reports.status.new')}</SelectItem>
            <SelectItem value="in_progress">{t('admin.reports.status.in_progress')}</SelectItem>
            <SelectItem value="resolved">{t('admin.reports.status.resolved')}</SelectItem>
            <SelectItem value="rejected">{t('admin.reports.status.rejected')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left">
              <th className="px-4 py-2.5 font-medium text-muted-foreground w-10">#</th>
              <th className="px-4 py-2.5 font-medium text-muted-foreground">{t('admin.reports.table.user')}</th>
              <th className="px-4 py-2.5 font-medium text-muted-foreground">{t('admin.reports.table.subject')}</th>
              <th className="px-4 py-2.5 font-medium text-muted-foreground w-24">{t('admin.reports.table.category')}</th>
              <th className="px-4 py-2.5 font-medium text-muted-foreground w-28">{t('admin.reports.table.status')}</th>
              <th className="px-4 py-2.5 font-medium text-muted-foreground w-24">{t('admin.reports.table.date')}</th>
              <th className="px-4 py-2.5 font-medium text-muted-foreground w-20 text-right">{t('admin.reports.table.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-20 text-muted-foreground text-sm">
                  <MessageSquareWarning className="h-10 w-10 mx-auto mb-3 opacity-20" />
                  {t('admin.reports.noComplaints')}
                </td>
              </tr>
            ) : filtered.map((c, i) => {
              const cfg = STATUS_CONFIG[c.status];
              const Icon = cfg.icon;
              return (
                <tr key={c.id} className={`border-b transition-colors hover:bg-muted/20 ${c.status === 'new' ? 'bg-blue-50/30' : ''}`}>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium leading-tight">{c.userName}</div>
                    <div className="text-xs text-muted-foreground">{c.userEmail}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="line-clamp-1">{c.subject}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="text-xs font-normal">{t(`admin.reports.category.${c.category}`)}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.cls}`}>
                      <Icon className="h-3 w-3" />
                      {t(`admin.reports.status.${c.status}`)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelected(c)}>
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detail dialog */}
      {selected && (
        <Dialog open onOpenChange={() => setSelected(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base">
                <MessageSquareWarning className="h-4 w-4 text-primary" />
                {selected.subject}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-4 text-muted-foreground">
                <span><strong className="text-foreground">{selected.userName}</strong> · {selected.userEmail}</span>
                <Badge variant="outline" className="text-xs">{t(`admin.reports.category.${selected.category}`)}</Badge>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 leading-relaxed text-sm">
                {selected.message}
              </div>
              <div className="text-xs text-muted-foreground">
                {t('admin.reports.submitted', { date: new Date(selected.createdAt).toLocaleString() })}
                {selected.resolvedAt && <span> {t('admin.reports.resolvedAt', { date: new Date(selected.resolvedAt).toLocaleString() })}</span>}
              </div>
              {/* Status actions */}
              <div className="flex items-center gap-2 pt-2 border-t">
                <span className="text-xs text-muted-foreground mr-1">{t('admin.reports.changeStatus')}</span>
                {(['in_progress', 'resolved', 'rejected'] as ComplaintStatus[]).map((s) => {
                  const cfg = STATUS_CONFIG[s];
                  const Icon = cfg.icon;
                  return (
                    <Button
                      key={s}
                      variant={selected.status === s ? 'default' : 'outline'}
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => changeStatus(selected.id, s)}
                    >
                      <Icon className="h-3 w-3" />
                      {t(`admin.reports.status.${s}`)}
                    </Button>
                  );
                })}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
