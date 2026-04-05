import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreditCard, FileText, Calendar, Palette, Wallet, RefreshCw, Undo2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import {
  getMyBillingSummary, getMyBillingHistory, PaymentListItemDto,
} from '@/services/billingService';
import { createRefundRequest } from '@/services/refundService';

function formatUzs(n: number): string {
  return new Intl.NumberFormat('uz-UZ').format(n) + ' UZS';
}

function formatDate(d: string | null): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  const s = status.toLowerCase();
  if (s === 'completed' || s === 'released') return 'default';
  if (s === 'escrowed') return 'secondary';
  if (s === 'pending') return 'outline';
  if (s === 'failed' || s === 'refunded') return 'destructive';
  return 'secondary';
}

function describe(p: PaymentListItemDto): string {
  switch (p.purpose) {
    case 'Subscription': return p.planName ? `${p.planName} subscription` : 'Subscription';
    case 'Template':     return p.templateName ? `Template: ${p.templateName}` : 'Template purchase';
    case 'Booking':      return p.hrExpertName
      ? `Session with ${p.hrExpertName}${p.scheduledAt ? ` — ${formatDate(p.scheduledAt)}` : ''}`
      : 'HR session';
    default: return p.purpose;
  }
}

export default function BillingPage() {
  const qc = useQueryClient();
  const [purpose, setPurpose] = useState<string>('all');
  const [selected, setSelected] = useState<PaymentListItemDto | null>(null);

  // Refund dialog state
  const [refundTarget, setRefundTarget] = useState<PaymentListItemDto | null>(null);
  const [refundReason, setRefundReason] = useState('');

  const summaryQuery = useQuery({
    queryKey: ['my-billing-summary'],
    queryFn: getMyBillingSummary,
  });

  const historyQuery = useQuery({
    queryKey: ['my-billing-history', purpose],
    queryFn: () => getMyBillingHistory({
      purpose: purpose === 'all' ? undefined : purpose,
      pageSize: 100,
    }),
  });

  const refundMutation = useMutation({
    mutationFn: async () => {
      if (!refundTarget || !refundTarget.bookingId) throw new Error('No booking selected');
      return createRefundRequest(refundTarget.bookingId, refundReason);
    },
    onSuccess: () => {
      toast.success('Refund request submitted. Admin will review it.');
      setRefundTarget(null);
      setRefundReason('');
      qc.invalidateQueries({ queryKey: ['my-billing-history'] });
      qc.invalidateQueries({ queryKey: ['my-billing-summary'] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to submit refund request');
    },
  });

  const items = historyQuery.data?.items ?? [];

  return (
    <div className="h-full overflow-y-auto bg-muted/30">
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Billing History</h1>
          <p className="text-sm text-muted-foreground">
            All your payments on CareerBoost — subscriptions, templates, and HR sessions.
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <SummaryCard
            icon={<Wallet className="h-4 w-4 text-blue-600" />}
            label="Total Spent"
            value={summaryQuery.data?.totalSpent ?? 0}
            count={summaryQuery.data?.paymentsCount}
            loading={summaryQuery.isLoading}
          />
          <SummaryCard
            icon={<CreditCard className="h-4 w-4 text-violet-600" />}
            label="Subscriptions"
            value={summaryQuery.data?.subscriptionsTotal ?? 0}
            loading={summaryQuery.isLoading}
          />
          <SummaryCard
            icon={<Palette className="h-4 w-4 text-emerald-600" />}
            label="Templates"
            value={summaryQuery.data?.templatesTotal ?? 0}
            loading={summaryQuery.isLoading}
          />
          <SummaryCard
            icon={<Calendar className="h-4 w-4 text-orange-600" />}
            label="HR Sessions"
            value={summaryQuery.data?.bookingsTotal ?? 0}
            loading={summaryQuery.isLoading}
          />
          <SummaryCard
            icon={<Undo2 className="h-4 w-4 text-rose-600" />}
            label="Refunded"
            value={summaryQuery.data?.refundedTotal ?? 0}
            loading={summaryQuery.isLoading}
          />
        </div>

        {/* Filter + table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Transactions</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={purpose} onValueChange={setPurpose}>
                <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="Subscription">Subscriptions</SelectItem>
                  <SelectItem value="Template">Templates</SelectItem>
                  <SelectItem value="Booking">HR sessions</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => historyQuery.refetch()}
                disabled={historyQuery.isFetching}
              >
                <RefreshCw className={`h-4 w-4 ${historyQuery.isFetching ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {historyQuery.isLoading ? (
              <div className="py-12 text-center text-sm text-muted-foreground">Loading…</div>
            ) : items.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                No payments yet.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map(p => (
                    <TableRow
                      key={p.id}
                      className="cursor-pointer hover:bg-accent/50"
                      onClick={() => setSelected(p)}
                    >
                      <TableCell className="text-sm">{formatDate(p.createdAt)}</TableCell>
                      <TableCell className="font-medium">{describe(p)}</TableCell>
                      <TableCell><Badge variant="outline">{p.purpose}</Badge></TableCell>
                      <TableCell className="text-right font-semibold">{formatUzs(p.amountUzs)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant={statusVariant(p.status)}>{p.status}</Badge>
                          {p.activeRefundStatus && (
                            <Badge
                              variant={p.activeRefundStatus === 'Approved' ? 'destructive' : 'outline'}
                              className="text-[10px]"
                            >
                              Refund: {p.activeRefundStatus}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {p.canRequestRefund && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRefundTarget(p);
                              setRefundReason('');
                            }}
                          >
                            <Undo2 className="h-3 w-3 mr-1" />
                            Refund
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
      </div>

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <Row label="Description" value={describe(selected)} />
              <Row label="Type" value={selected.purpose} />
              <Row label="Status" value={selected.status} />
              <Row label="Amount" value={formatUzs(selected.amountUzs)} />
              <Row label="Created" value={formatDate(selected.createdAt)} />
              <Row label="Paid at" value={formatDate(selected.paidAt)} />
              {selected.purpose === 'Booking' && (
                <>
                  <Row label="Released" value={formatDate(selected.releasedAt)} />
                  <Row label="Session date" value={formatDate(selected.scheduledAt)} />
                </>
              )}
              {selected.refundedAt && (
                <Row label="Refunded at" value={formatDate(selected.refundedAt)} />
              )}
              {selected.activeRefundStatus && (
                <Row label="Refund status" value={selected.activeRefundStatus} />
              )}
              {selected.stripeSessionId && (
                <Row label="Stripe session" value={selected.stripeSessionId} mono />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Refund request dialog */}
      <Dialog open={!!refundTarget} onOpenChange={(open) => !open && setRefundTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request Refund</DialogTitle>
            <DialogDescription>
              Please explain why you're requesting a refund. Admin will review your request within 1-2 business days.
            </DialogDescription>
          </DialogHeader>
          {refundTarget && (
            <div className="space-y-3 text-sm">
              <div className="rounded-md bg-muted p-3 space-y-1">
                <div className="font-medium">{describe(refundTarget)}</div>
                <div className="text-muted-foreground">Amount: {formatUzs(refundTarget.amountUzs)}</div>
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Reason *</label>
                <Textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="e.g. HR expert didn't show up, session quality was poor, etc."
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundTarget(null)}>Cancel</Button>
            <Button
              onClick={() => refundMutation.mutate()}
              disabled={refundReason.trim().length < 5 || refundMutation.isPending}
            >
              {refundMutation.isPending ? 'Submitting…' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SummaryCard({
  icon, label, value, count, loading,
}: { icon: React.ReactNode; label: string; value: number; count?: number; loading?: boolean }) {
  return (
    <div className="rounded-2xl bg-card border p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <div className="h-8 w-8 rounded-xl bg-muted flex items-center justify-center">{icon}</div>
      </div>
      <div>
        <p className="text-2xl font-bold">{loading ? '—' : formatUzs(value)}</p>
        {count !== undefined && !loading && (
          <p className="text-xs text-muted-foreground mt-1">{count} transactions</p>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className={`text-right ${mono ? 'font-mono text-xs' : 'font-medium'} break-all`}>
        {value}
      </span>
    </div>
  );
}
