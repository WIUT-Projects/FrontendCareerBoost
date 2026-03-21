import { Badge } from '@/components/ui/badge';

interface Props {
  status: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-gray-100 text-gray-700 hover:bg-gray-100' },
  reviewed: { label: 'Reviewed', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
  accepted: { label: 'Accepted', className: 'bg-green-100 text-green-700 hover:bg-green-100' },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700 hover:bg-red-100' },
};

export function ApplicationStatusBadge({ status }: Props) {
  const key = status?.toLowerCase() ?? 'pending';
  const config = STATUS_CONFIG[key] ?? STATUS_CONFIG.pending;
  return <Badge className={config.className}>{config.label}</Badge>;
}
