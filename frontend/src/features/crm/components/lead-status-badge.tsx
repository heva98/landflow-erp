import { Badge } from '@/components/ui/badge'

import { LEAD_STATUS_LABELS, type LeadStatus } from '../types'

const statusVariant: Record<LeadStatus, 'success' | 'warning' | 'info' | 'secondary' | 'destructive' | 'default'> = {
  new: 'default',
  contacted: 'info',
  interested: 'info',
  site_visit: 'warning',
  negotiating: 'warning',
  reserved: 'secondary',
  purchased: 'success',
  lost: 'destructive',
}

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return <Badge variant={statusVariant[status]}>{LEAD_STATUS_LABELS[status]}</Badge>
}
