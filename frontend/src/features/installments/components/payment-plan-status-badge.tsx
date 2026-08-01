import { Badge } from '@/components/ui/badge'

import { PAYMENT_PLAN_STATUS_LABELS, type PaymentPlanStatus } from '../types'

const statusVariant: Record<PaymentPlanStatus, 'success' | 'info' | 'destructive' | 'secondary'> = {
  active: 'success',
  completed: 'info',
  defaulted: 'destructive',
  cancelled: 'secondary',
}

export function PaymentPlanStatusBadge({ status }: { status: PaymentPlanStatus }) {
  return <Badge variant={statusVariant[status]}>{PAYMENT_PLAN_STATUS_LABELS[status]}</Badge>
}
