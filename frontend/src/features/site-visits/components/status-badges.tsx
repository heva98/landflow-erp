import { Badge } from '@/components/ui/badge'

import {
  BOOKING_STATUS_LABELS,
  FOLLOW_UP_STATUS_LABELS,
  SITE_VISIT_STATUS_LABELS,
  type BookingStatus,
  type FollowUpStatus,
  type SiteVisitStatus,
} from '../types'

type Variant = 'secondary' | 'info' | 'warning' | 'success' | 'destructive'

const siteVisitVariant: Record<SiteVisitStatus, Variant> = {
  scheduled: 'secondary',
  in_progress: 'info',
  completed: 'success',
  cancelled: 'destructive',
}
export function SiteVisitStatusBadge({ status }: { status: SiteVisitStatus }) {
  return <Badge variant={siteVisitVariant[status]}>{SITE_VISIT_STATUS_LABELS[status]}</Badge>
}

const bookingVariant: Record<BookingStatus, Variant> = {
  booked: 'secondary',
  confirmed: 'info',
  cancelled: 'destructive',
  no_show: 'warning',
}
export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return <Badge variant={bookingVariant[status]}>{BOOKING_STATUS_LABELS[status]}</Badge>
}

const followUpVariant: Record<FollowUpStatus, Variant> = {
  pending: 'warning',
  done: 'success',
}
export function FollowUpStatusBadge({ status }: { status: FollowUpStatus }) {
  return <Badge variant={followUpVariant[status]}>{FOLLOW_UP_STATUS_LABELS[status]}</Badge>
}
