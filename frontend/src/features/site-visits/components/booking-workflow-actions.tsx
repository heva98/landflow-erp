import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/hooks/use-auth'

import { useCancelBookingMutation, useConfirmBookingMutation, useMarkBookingNoShowMutation } from '../hooks/use-site-visits'
import { canManageBookings } from '../lib/permissions'
import type { SiteVisitBooking } from '../types'

export function BookingWorkflowActions({ booking }: { booking: SiteVisitBooking }) {
  const { user } = useAuth()
  const canManage = canManageBookings(user?.permissions)
  const confirm = useConfirmBookingMutation(booking.id)
  const cancel = useCancelBookingMutation(booking.id)
  const noShow = useMarkBookingNoShowMutation(booking.id)

  if (!canManage) return null

  return (
    <div className="flex flex-wrap gap-2">
      {booking.status === 'booked' && (
        <Button size="sm" disabled={confirm.isPending} onClick={() => confirm.mutate()}>
          Confirm
        </Button>
      )}
      {(booking.status === 'booked' || booking.status === 'confirmed') && (
        <>
          <Button size="sm" variant="outline" disabled={noShow.isPending} onClick={() => noShow.mutate()}>
            Mark no-show
          </Button>
          <Button size="sm" variant="destructive" disabled={cancel.isPending} onClick={() => cancel.mutate()}>
            Cancel
          </Button>
        </>
      )}
    </div>
  )
}
