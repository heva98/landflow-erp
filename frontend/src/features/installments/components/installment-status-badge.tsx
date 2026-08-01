import { Badge } from '@/components/ui/badge'

import { INSTALLMENT_STATUS_LABELS, type InstallmentStatus } from '../types'

const statusVariant: Record<InstallmentStatus, 'success' | 'warning' | 'secondary' | 'destructive'> = {
  pending: 'secondary',
  partial: 'warning',
  paid: 'success',
  overdue: 'destructive',
}

export function InstallmentStatusBadge({ status }: { status: InstallmentStatus }) {
  return <Badge variant={statusVariant[status]}>{INSTALLMENT_STATUS_LABELS[status]}</Badge>
}
