import { Badge } from '@/components/ui/badge'

import { PLOT_STATUS_LABELS, type PlotStatus } from '../types'

const statusVariant: Record<PlotStatus, 'success' | 'warning' | 'info' | 'secondary' | 'destructive'> = {
  available: 'success',
  reserved: 'warning',
  sold: 'info',
  transferred: 'secondary',
  cancelled: 'destructive',
}

export function PlotStatusBadge({ status }: { status: PlotStatus }) {
  return <Badge variant={statusVariant[status]}>{PLOT_STATUS_LABELS[status]}</Badge>
}
