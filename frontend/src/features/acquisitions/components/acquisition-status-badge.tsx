import { Badge } from '@/components/ui/badge'

import { ACQUISITION_STATUS_LABELS, type AcquisitionStatus } from '../types'

const statusVariant: Record<AcquisitionStatus, 'secondary' | 'info' | 'warning' | 'success' | 'destructive'> = {
  potential: 'secondary',
  negotiating: 'info',
  approved: 'warning',
  purchased: 'success',
  cancelled: 'destructive',
}

export function AcquisitionStatusBadge({ status }: { status: AcquisitionStatus }) {
  return <Badge variant={statusVariant[status]}>{ACQUISITION_STATUS_LABELS[status]}</Badge>
}
