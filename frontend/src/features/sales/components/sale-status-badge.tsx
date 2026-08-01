import { Badge } from '@/components/ui/badge'

import { SALE_STATUS_LABELS, type SaleStatus } from '../types'

const statusVariant: Record<SaleStatus, 'success' | 'destructive'> = {
  active: 'success',
  cancelled: 'destructive',
}

export function SaleStatusBadge({ status }: { status: SaleStatus }) {
  return <Badge variant={statusVariant[status]}>{SALE_STATUS_LABELS[status]}</Badge>
}
