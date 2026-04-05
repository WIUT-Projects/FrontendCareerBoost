import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  CreditCard, DollarSign, Wallet, TrendingUp, Clock, CheckCircle2, RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  getAdminPayments, getAdminPaymentsSummary, getAdminHrEarnings, markEarningPaidOut,
  AdminPaymentListItem, AdminHrEarning,
} from '@/services/adminService';

function formatUzs(n: number): string {
  return new Intl.NumberFormat('uz-UZ').format(n) + ' UZS';
}

function formatDate(d: string | null): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function statusVariant(s: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  const x = s.toLowerCase();
  if (x === 'completed' || x === 'released') return 'default';
  if (x === 'escrowed') return 'secondary';
  if (x === 'pending') return 'outline';
  if (x === 'failed' || x === 'refunded') return 'destructive';
  return 'secondary';
}

export default function AdminPaymentsPage() {
  const [tab, setTab] = useState<'all' | 'payments' | 'earnings'>('all');
  const [purpose, setPurpose] = useState<string>('all');
  const [status, setStatus] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  const [selectedEarning, setSelectedEarning] = useState<AdminHrEarning | null>(null);
  const [payoutNote, setPayoutNote] = useState<string>('');

  const qc = useQueryClient();

  const summaryQuery = useQuery({
    queryKey: ['admin-payments-summary'],
    queryFn: getAdminPaymentsSummary,
  });

  const paymentsQuery = useQuery({
    queryKey: ['admin-payments', purpose, status, search],
    queryFn: () => getAdminPayments({
      purpose: purpose === 'all' ? undefined : purpose,
      status:  status  === 'all' ? undefined : status,
      search:  search || undefined,
      pageSize: 100,
    }),
  });

  const earningsQuery = useQuery({
    queryKey: ['admin-hr-earnings'],
    queryFn: () => getAdminHrEarnings(),
  });

  const handleMarkPaid = async () => {
    if (!selectedEarning) return;
    try {
      await markEarningPaidOut(selectedEarning.id, payoutNote || undefined);
      toast.success('Earning marked as paid out');
      setSelectedEarning(null);
      setPayoutNote('');
      qc.invalidateQueries({ queryKey: ['admin-hr-earnings'] });
      qc.invalidateQueries({ queryKey: ['admin-payments-summary'] });
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to mark as paid');
    }
  };

  const s = summaryQuery.data;
  const payments = paymentsQuery.data?.items ?? [];
  const earnings = earningsQuery.data ?? [];

  return (
    <div className="h-full overflow-y-auto bg-muted/30">
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Payments & Revenue</h1>
          <p className="text-sm text-muted-foreground">
            Subscriptions, template sales, and HR booking escrow — all in one place.
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard icon={<TrendingUp className="h-4 w-4 text-emerald-600" />}
            label="Total Revenue" value={s?.totalRevenue ?? 0} loading={summaryQuery.isLoading} />
          <StatCard icon={<CreditCard className="h-4 w-4 text-blue-600" />}
            label="Subscriptions" value={s?.subscriptionRevenue ?? 0} loading={summaryQuery.isLoading} />
          <StatCard icon={<DollarSign className="h-4 w-4 text-violet-600" />}
            label="HR Bookings" value={s?.bookingGrossRevenue ?? 0} loading={summaryQuery.isLoading}
            hint={s ? `${formatUzs(s.escrowedBalance)} in escrow` : undefined} />
          <StatCard icon={<Wallet className="h-4 w-4 text-orange-600" />}
            label="Platform Fee" value={s?.platformFeeEarned ?? 0} loading={summaryQuery.isLoading} />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard icon={<Clock className="h-4 w-4 text-amber-600" />}
            label="Pending Payouts" value={s?.pendingPayouts ?? 0} loading={summaryQuery.isLoading}
            hint="Available for HR" />
          <StatCard icon={<CheckCircle2 className="h-4 w-4 text-green-600" />}
            label="Paid to HR" value={s?.totalPaidOutToHr ?? 0} loading={summaryQuery.isLoading} />
          <div className="rounded-2xl bg-card border p-5 flex flex-col gap-3 col-span-2 lg:col-span-2">
            <span className="text-xs font-medium text-muted-foreground">Totals</span>
            <div className="text-sm text-muted-foreground">
              {s?.totalPaymentsCount ?? 0} payments · {earnings.length} earnings entries
            </div>
          </div>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList>
            <TabsTrigger value="all">All Payments</TabsTrigger>
            <TabsTrigger value="payments">By Type</TabsTrigger>
            <TabsTrigger value="earnings">HR Earnings / Payouts</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <PaymentsTable
              items={payments}
              loading={paymentsQuery.isLoading}
              purpose={purpose} setPurpose={setPurpose}
              status={status} setStatus={setStatus}
              search={search} setSearch={setSearch}
              onRefresh={() => paymentsQuery.refetch()}
              fetching={paymentsQuery.isFetching}
            />
          </TabsContent>

          <TabsContent value="payments" className="mt-4">
            <PaymentsTable
              items={payments}
              loading={paymentsQuery.isLoading}
              purpose={purpose} setPurpose={setPurpose}
              status={status} setStatus={setStatus}
              search={search} setSearch={setSearch}
              onRefresh={() => paymentsQuery.refetch()}
              fetching={paymentsQuery.isFetching}
            />
          </TabsContent>

          <TabsContent value="earnings" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">HR Expert Earnings Ledger</CardTitle>
                <Button variant="outline" size="icon"
                  onClick={() => earningsQuery.refetch()}
                  disabled={earningsQuery.isFetching}>
                  <RefreshCw className={`h-4 w-4 ${earningsQuery.isFetching ? 'animate-spin' : ''}`} />
                </Button>
              </CardHeader>
              <CardContent>
                {earningsQuery.isLoading ? (
                  <div className="py-12 text-center text-sm text-muted-foreground">Loading…</div>
                ) : earnings.length === 0 ? (
                  <div className="py-12 text-center text-sm text-muted-foreground">
                    No HR earnings yet.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Created</TableHead>
                        <TableHead>Job Seeker</TableHead>
                        <TableHead>Session</TableHead>
                        <TableHead className="text-right">Gross</TableHead>
                        <TableHead className="text-right">Fee</TableHead>
                        <TableHead className="text-right">Net</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {earnings.map(e => (
                        <TableRow key={e.id}>
                          <TableCell className="text-sm">{formatDate(e.createdAt)}</TableCell>
                          <TableCell>{e.jobSeekerName ?? '—'}</TableCell>
                          <TableCell className="text-sm">{formatDate(e.scheduledAt)}</TableCell>
                          <TableCell className="text-right">{formatUzs(e.amountUzs)}</TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {formatUzs(e.platformFeeUzs)}
                          </TableCell>
                          <TableCell className="text-right font-semibold">{formatUzs(e.netAmountUzs)}</TableCell>
                          <TableCell>
                            <Badge variant={e.status === 'Available' ? 'default' : 'secondary'}>
                              {e.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {e.status === 'Available' && (
                              <Button size="sm" variant="outline"
                                onClick={() => setSelectedEarning(e)}>
                                Mark paid
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Mark as paid dialog */}
      <Dialog open={!!selectedEarning} onOpenChange={(open) => !open && setSelectedEarning(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Earning as Paid Out</DialogTitle>
          </DialogHeader>
          {selectedEarning && (
            <div className="space-y-3 text-sm">
              <div className="bg-muted p-3 rounded-lg">
                <div className="flex justify-between mb-1">
                  <span className="text-muted-foreground">Net amount</span>
                  <span className="font-bold">{formatUzs(selectedEarning.netAmountUzs)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Job seeker</span>
                  <span>{selectedEarning.jobSeekerName ?? '—'}</span>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Payout note (transfer ref, bank, etc.)
                </label>
                <Input
                  value={payoutNote}
                  onChange={(e) => setPayoutNote(e.target.value)}
                  placeholder="e.g. Bank transfer #12345"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedEarning(null)}>Cancel</Button>
            <Button onClick={handleMarkPaid}>Confirm Paid</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function StatCard({
  icon, label, value, hint, loading,
}: { icon: React.ReactNode; label: string; value: number; hint?: string; loading?: boolean }) {
  return (
    <div className="rounded-2xl bg-card border p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <div className="h-8 w-8 rounded-xl bg-muted flex items-center justify-center">{icon}</div>
      </div>
      <div>
        <p className="text-2xl font-bold">{loading ? '—' : formatUzs(value)}</p>
        {hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
      </div>
    </div>
  );
}

function PaymentsTable({
  items, loading, purpose, setPurpose, status, setStatus, search, setSearch, onRefresh, fetching,
}: {
  items: AdminPaymentListItem[];
  loading: boolean;
  purpose: string; setPurpose: (v: string) => void;
  status: string; setStatus: (v: string) => void;
  search: string; setSearch: (v: string) => void;
  onRefresh: () => void;
  fetching: boolean;
}) {
  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Select value={purpose} onValueChange={setPurpose}>
            <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="Subscription">Subscriptions</SelectItem>
              <SelectItem value="Template">Templates</SelectItem>
              <SelectItem value="Booking">HR Bookings</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Escrowed">Escrowed</SelectItem>
              <SelectItem value="Released">Released</SelectItem>
              <SelectItem value="Failed">Failed</SelectItem>
              <SelectItem value="Refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Search email / name / session"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-[250px]"
          />
          <Button variant="outline" size="icon" onClick={onRefresh} disabled={fetching}>
            <RefreshCw className={`h-4 w-4 ${fetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-12 text-center text-sm text-muted-foreground">Loading…</div>
        ) : items.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">No payments found.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="text-sm">{formatDate(p.createdAt)}</TableCell>
                  <TableCell>
                    <div className="font-medium">{p.userFullName ?? '—'}</div>
                    <div className="text-xs text-muted-foreground">{p.userEmail}</div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {p.purpose === 'Booking'
                      ? `${p.hrExpertName ?? 'HR'} · ${formatDate(p.scheduledAt)}`
                      : (p.planName ?? p.templateName ?? '—')}
                  </TableCell>
                  <TableCell><Badge variant="outline">{p.purpose}</Badge></TableCell>
                  <TableCell className="text-right font-semibold">{formatUzs(p.amountUzs)}</TableCell>
                  <TableCell><Badge variant={statusVariant(p.status)}>{p.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
