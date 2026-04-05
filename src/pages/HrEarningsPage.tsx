import { useQuery } from '@tanstack/react-query';
import { DollarSign, Clock, Wallet, CheckCircle2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  getHrEarningsSummary, getHrEarnings, HrEarningListItem,
} from '@/services/hrEarningsService';

function formatUzs(n: number): string {
  return new Intl.NumberFormat('uz-UZ').format(n) + ' UZS';
}

function formatDate(d: string | null): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function statusVariant(s: string): 'default' | 'secondary' | 'outline' {
  if (s === 'Available') return 'default';
  if (s === 'PaidOut')   return 'secondary';
  return 'outline';
}

export default function HrEarningsPage() {
  const summaryQuery = useQuery({
    queryKey: ['hr-earnings-summary'],
    queryFn: getHrEarningsSummary,
  });

  const listQuery = useQuery({
    queryKey: ['hr-earnings-list'],
    queryFn: () => getHrEarnings({ pageSize: 100 }),
  });

  const items: HrEarningListItem[] = listQuery.data ?? [];
  const s = summaryQuery.data;

  return (
    <div className="h-full overflow-y-auto bg-muted/30">
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Earnings</h1>
          <p className="text-sm text-muted-foreground">
            Track your income from HR sessions. Payments are released after the job seeker
            submits feedback (or automatically 24 hours after the session).
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard icon={<DollarSign className="h-4 w-4 text-emerald-600" />}
            label="Total Earned" value={s?.totalEarned ?? 0} loading={summaryQuery.isLoading} />
          <StatCard icon={<Clock className="h-4 w-4 text-amber-600" />}
            label="Pending (Escrow)" value={s?.pendingEscrow ?? 0} loading={summaryQuery.isLoading}
            hint="Awaiting session feedback" />
          <StatCard icon={<Wallet className="h-4 w-4 text-blue-600" />}
            label="Available Balance" value={s?.availableBalance ?? 0} loading={summaryQuery.isLoading}
            hint="Ready for payout" />
          <StatCard icon={<CheckCircle2 className="h-4 w-4 text-violet-600" />}
            label="Paid Out" value={s?.paidOut ?? 0} loading={summaryQuery.isLoading} />
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">
              Earnings History {s?.totalBookings ? `(${s.totalBookings} sessions)` : ''}
            </CardTitle>
            <Button
              variant="outline"
              size="icon"
              onClick={() => { summaryQuery.refetch(); listQuery.refetch(); }}
              disabled={listQuery.isFetching}
            >
              <RefreshCw className={`h-4 w-4 ${listQuery.isFetching ? 'animate-spin' : ''}`} />
            </Button>
          </CardHeader>
          <CardContent>
            {listQuery.isLoading ? (
              <div className="py-12 text-center text-sm text-muted-foreground">Loading…</div>
            ) : items.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-30" />
                No earnings yet. Complete a session to start earning.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Session Date</TableHead>
                    <TableHead>Job Seeker</TableHead>
                    <TableHead className="text-right">Gross</TableHead>
                    <TableHead className="text-right">Fee</TableHead>
                    <TableHead className="text-right">Net</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Paid Out</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map(e => (
                    <TableRow key={e.id}>
                      <TableCell className="text-sm">{formatDate(e.scheduledAt)}</TableCell>
                      <TableCell className="font-medium">{e.jobSeekerName ?? '—'}</TableCell>
                      <TableCell className="text-right">{formatUzs(e.amountUzs)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        -{formatUzs(e.platformFeeUzs)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">{formatUzs(e.netAmountUzs)}</TableCell>
                      <TableCell><Badge variant={statusVariant(e.status)}>{e.status}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(e.paidOutAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

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
        <p className="text-2xl font-bold">{loading ? '—' : new Intl.NumberFormat('uz-UZ').format(value) + ' UZS'}</p>
        {hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
      </div>
    </div>
  );
}
