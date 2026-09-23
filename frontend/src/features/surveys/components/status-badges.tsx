import { Badge } from '@/components/ui/badge'

import {
  SUBDIVISION_STATUS_LABELS,
  SURVEY_STATUS_LABELS,
  type SubdivisionStatus,
  type SurveyStatus,
} from '../types'

type Variant = 'secondary' | 'info' | 'warning' | 'success' | 'destructive'

const surveyVariant: Record<SurveyStatus, Variant> = {
  scheduled: 'secondary',
  in_progress: 'info',
  completed: 'warning',
  approved: 'success',
  rejected: 'destructive',
}
export function SurveyStatusBadge({ status }: { status: SurveyStatus }) {
  return <Badge variant={surveyVariant[status]}>{SURVEY_STATUS_LABELS[status]}</Badge>
}

const subdivisionVariant: Record<SubdivisionStatus, Variant> = {
  draft: 'secondary',
  submitted: 'info',
  approved: 'success',
  rejected: 'destructive',
}
export function SubdivisionStatusBadge({ status }: { status: SubdivisionStatus }) {
  return <Badge variant={subdivisionVariant[status]}>{SUBDIVISION_STATUS_LABELS[status]}</Badge>
}
