import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Undo2, CheckCircle2, XCircle, RefreshCw, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
  getAdminRefundRequests, approveRefundRequest, rejectRefundRequest,
  RefundRequestDto,
} from '@/services/refundService';

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
  if (s === 'Approved') return 'default';
  if (s === 'Pending')  return 'outline';
  if (s === 'Rejected') return 'destructive';
  return 'secondary';
}

export default function AdminRefundsPage() {
  const qc = useQueryClient();
  const [status, setStatus] = useState<string>('all');

  // Review dialog
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [target, setTarget] = useState<RefundRequestDto | null>(null);
  const [note, setNote] = useState('');

  const refundsQuery = useQuery({
    queryKey: ['admin-refunds', status],
    queryFn: () => getAdminRefundRequests({
      status: status === 'all' ? undefined : status,
      pageSize: 100,
    }),
  });

  const approveMutation = useMutation({
    mutationFn: (id: number) => approveRefundRequest(id, note),
    onSuccess: () => {
      toast.success('Refund approved. Payment marked as Refunded.');
      closeDialog();
      qc.invalidateQueries({ queryKey: ['admin-refunds'] });
      qc.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: number) => rejectRefundRequest(id, note),
    onSuccess: () => {
      toast.success('Refund rejected.');
      closeDialog();
      qc.invalidateQueries({ queryKey: ['admin-refunds'] });
      qc.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const closeDialog = () => {
    setAction(null);
    setTarget(null);
    setNote('');
  };

  const openReview = (refund: RefundRequestDto, act: 'approve' | 'reject') => {
    setTarget(refund);
    setAction(act);
    setNote('');
  };

  const items = refundsQuery.data?.items ?? [];
  const pendingCount = items.filter(r => r.status === 'Pending').length;

  return (
    <div className="h-full overflow-y-auto bg-muted/30">
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Undo2 className="h-6 w-6" />
              Refund Requests
            </h1>
            <p className="text-sm text-muted-foreground">
              Review job seeker refund requests and approve or reject them.
            </p>
          </div>
          {pendingCount > 0 && (
            <Badge variant="outline" className="text-sm px-3 py-1">
              <Clock className="h-3 w-3 mr-1" />
              {pendingCount} pending
            </Badge>
          )}
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">All Refund Requests</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => refundsQuery.refetch()}
                disabled={refundsQuery.isFetching}
              >
                <RefreshCw className={`h-4 w-4 ${refundsQuery.isFetching ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {refundsQuery.isLoading ? (
              <div className="py-12 text-center text-sm text-muted-foreground">Loading…</div>
            ) : items.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No refund requests found.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Requested</TableHead>
                    <TableHead>Job Seeker</TableHead>
                    <TableHead>Session</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map(r => (
                    <TableRow key={r.id}>
                      <TableCell className="text-sm">{formatDate(r.createdAt)}</TableCell>
                      <TableCell>
                        <div className="font-medium">{r.jobSeekerName || '—'}</div>
                        <div className="text-xs text-muted-foreground">{r.jobSeekerEmail}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{r.hrExpertName || 'HR Expert'}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(r.sessionScheduledAt)}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[240px]">
                        <div className="text-xs text-muted-foreground line-clamp-2">{r.reason}</div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">{formatUzs(r.amountUzs)}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(r.status)}>{r.status}</Badge>
                        {r.adminNote && (
                          <div className="text-[10px] text-muted-foreground mt-1 line-clamp-2 max-w-[160px]">
                            {r.adminNote}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {r.status === 'Pending' && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => openReview(r, 'approve')}
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openReview(r, 'reject')}
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Reject
                            </Button>
                          </div>
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

      {/* Review dialog */}
      <Dialog open={!!action} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {action === 'approve' ? 'Approve Refund' : 'Reject Refund'}
            </DialogTitle>
            <DialogDescription>
              {action === 'approve'
                ? 'This will mark the payment as Refunded and cancel any HR earning. The job seeker will be notified.'
                : 'This will reject the refund request. The job seeker will be notified.'}
            </DialogDescription>
          </DialogHeader>
          {target && (
            <div className="space-y-3 text-sm">
              <div className="rounded-md bg-muted p-3 space-y-1">
                <div className="font-medium">{target.jobSeekerName}</div>
                <div className="text-muted-foreground">
                  Session with {target.hrExpertName} — {formatDate(target.sessionScheduledAt)}
                </div>
                <div className="text-muted-foreground">Amount: {formatUzs(target.amountUzs)}</div>
              </div>
              <div>
                <div className="text-xs font-medium mb-1">Reason from job seeker:</div>
                <div className="text-xs text-muted-foreground rounded bg-muted p-2">{target.reason}</div>
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Admin note (optional)</label>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={action === 'approve'
                    ? 'Refund approved. Transfer will be processed within 3 business days.'
                    : 'Reason for rejection…'}
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button
              variant={action === 'approve' ? 'default' : 'destructive'}
              onClick={() => {
                if (!target) return;
                if (action === 'approve') approveMutation.mutate(target.id);
                else rejectMutation.mutate(target.id);
              }}
              disabled={approveMutation.isPending || rejectMutation.isPending}
            >
              {action === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
