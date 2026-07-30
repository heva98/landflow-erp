import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { formatTZS } from '@/lib/utils'

import { ReservationStatusBadge } from '../components/reservation-status-badge'
import { useCancelReservationMutation, useConvertReservationMutation, useReservationsQuery } from '../hooks/use-reservations'
import { canManageReservations } from '../lib/permissions'
import { RESERVATION_STATUS_LABELS, RESERVATION_STATUSES, type ReservationStatus } from '../types'

export function ReservationsListPage() {
  const [status, setStatus] = useState<ReservationStatus | 'all'>('all')
  const { user } = useAuth()
  const canManage = canManageReservations(user?.permissions)

  const { data, isLoading, isError } = useReservationsQuery({
    status: status === 'all' ? undefined : status,
  })
  const convertReservation = useConvertReservationMutation()
  const cancelReservation = useCancelReservationMutation()
  const columnCount = canManage ? 7 : 6

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Reservations</h1>
      </div>

      <div className="flex items-center gap-3">
        <Select value={status} onValueChange={(value) => setStatus(value as ReservationStatus | 'all')}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {RESERVATION_STATUSES.map((value) => (
              <SelectItem key={value} value={value}>
                {RESERVATION_STATUS_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plot</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Fee</TableHead>
              <TableHead>Reserved at</TableHead>
              <TableHead>Expiry date</TableHead>
              {canManage && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={columnCount} className="text-center text-muted-foreground">
                  Loading reservations…
                </TableCell>
              </TableRow>
            )}
            {isError && (
              <TableRow>
                <TableCell colSpan={columnCount} className="text-center text-destructive">
                  Failed to load reservations.
                </TableCell>
              </TableRow>
            )}
            {data && data.results.length === 0 && (
              <TableRow>
                <TableCell colSpan={columnCount} className="text-center text-muted-foreground">
                  No reservations yet.
                </TableCell>
              </TableRow>
            )}
            {data?.results.map((reservation) => (
              <TableRow key={reservation.id}>
                <TableCell className="font-medium text-foreground">{reservation.plot_number}</TableCell>
                <TableCell>{reservation.customer_name}</TableCell>
                <TableCell>
                  <ReservationStatusBadge status={reservation.status} />
                </TableCell>
                <TableCell>{formatTZS(reservation.reservation_fee)}</TableCell>
                <TableCell>{new Date(reservation.reserved_at).toLocaleString()}</TableCell>
                <TableCell>{new Date(reservation.expiry_date).toLocaleString()}</TableCell>
                {canManage && (
                  <TableCell>
                    {reservation.status === 'active' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={convertReservation.isPending}
                          onClick={() => convertReservation.mutate(reservation.id)}
                        >
                          Convert to sale
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={cancelReservation.isPending}
                          onClick={() => cancelReservation.mutate(reservation.id)}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
