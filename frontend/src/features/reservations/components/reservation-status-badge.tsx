import { Badge } from '@/components/ui/badge'

import { RESERVATION_STATUS_LABELS, type ReservationStatus } from '../types'

const statusVariant: Record<ReservationStatus, 'success' | 'info' | 'destructive' | 'secondary'> = {
  active: 'success',
  converted: 'info',
  expired: 'secondary',
  cancelled: 'destructive',
}

export function ReservationStatusBadge({ status }: { status: ReservationStatus }) {
  return <Badge variant={statusVariant[status]}>{RESERVATION_STATUS_LABELS[status]}</Badge>
}
