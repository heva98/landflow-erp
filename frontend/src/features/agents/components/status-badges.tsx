import { Badge } from '@/components/ui/badge'

import { COMMISSION_PAYMENT_STATUS_LABELS, type CommissionPaymentStatus } from '../types'

type Variant = 'secondary' | 'info' | 'warning' | 'success' | 'destructive'

const commissionPaymentVariant: Record<CommissionPaymentStatus, Variant> = {
  pending: 'secondary',
  approved: 'info',
  paid: 'success',
  cancelled: 'destructive',
}
export function CommissionPaymentStatusBadge({ status }: { status: CommissionPaymentStatus }) {
  return <Badge variant={commissionPaymentVariant[status]}>{COMMISSION_PAYMENT_STATUS_LABELS[status]}</Badge>
}
