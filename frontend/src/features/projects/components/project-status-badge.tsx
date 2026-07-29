import { Badge } from '@/components/ui/badge'

import { PROJECT_STATUS_LABELS, type ProjectStatus } from '../types'

const statusVariant: Record<ProjectStatus, 'secondary' | 'info' | 'warning' | 'success'> = {
  planning: 'secondary',
  development: 'info',
  selling: 'warning',
  completed: 'success',
}

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return <Badge variant={statusVariant[status]}>{PROJECT_STATUS_LABELS[status]}</Badge>
}
