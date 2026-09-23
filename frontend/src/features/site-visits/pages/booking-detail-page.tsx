import { ArrowLeft, Download } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/features/auth/hooks/use-auth'

import { AddFeedbackDialog } from '../components/add-feedback-dialog'
import { AddFollowUpDialog } from '../components/add-follow-up-dialog'
import { BookingWorkflowActions } from '../components/booking-workflow-actions'
import { BookingStatusBadge, FollowUpStatusBadge } from '../components/status-badges'
import { useBookingQuery, useMarkFollowUpDoneMutation } from '../hooks/use-site-visits'
import { canAddFeedback, canManageFollowUps } from '../lib/permissions'

const apiBaseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1'
const mediaOrigin = apiBaseURL.replace(/\/api\/v1\/?$/, '')

function resolveUrl(path: string) {
  return path.startsWith('http') ? path : `${mediaOrigin}${path}`
}

function FollowUpRow({ bookingId, followUpId, index, dueDate, status, notes, assignedToName, canManage }: {
  bookingId: string
  followUpId: string
  index: number
  dueDate: string
  status: 'pending' | 'done'
  notes: string
  assignedToName: string | null
  canManage: boolean
}) {
  const markDone = useMarkFollowUpDoneMutation(bookingId)

  return (
    <TableRow>
      <TableCell className="text-muted-foreground">{index + 1}</TableCell>
      <TableCell className="font-medium text-foreground">{dueDate}</TableCell>
      <TableCell>{notes || '—'}</TableCell>
      <TableCell>{assignedToName ?? '—'}</TableCell>
      <TableCell>
        <FollowUpStatusBadge status={status} />
      </TableCell>
      <TableCell>
        {canManage && status === 'pending' && (
          <Button size="sm" variant="outline" disabled={markDone.isPending} onClick={() => markDone.mutate(followUpId)}>
            Mark done
          </Button>
        )}
      </TableCell>
    </TableRow>
  )
}

export function BookingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const canFeedback = canAddFeedback(user?.permissions)
  const canFollowUp = canManageFollowUps(user?.permissions)
  const { data: booking, isLoading, isError } = useBookingQuery(id)

  if (isLoading) {
    return <p className="text-muted-foreground">Loading booking…</p>
  }

  if (isError || !booking) {
    return <p className="text-destructive">Booking not found.</p>
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Back">
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{booking.lead_name}</h1>
            <p className="text-sm text-muted-foreground">{booking.lead_phone || 'No phone on file'}</p>
          </div>
          <BookingStatusBadge status={booking.status} />
        </div>
        <BookingWorkflowActions booking={booking} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>QR check-in code</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3">
            <img src={resolveUrl(booking.qr_code)} alt="QR check-in code" className="size-48 rounded-lg bg-white p-2 ring-1 ring-foreground/10" />
            <a
              href={resolveUrl(booking.qr_code)}
              download
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary underline underline-offset-4"
            >
              <Download className="size-3.5" /> Download
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Guests</p>
              <p className="font-medium text-foreground">{booking.guest_count}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Checked in</p>
              <p className="font-medium text-foreground">
                {booking.is_checked_in
                  ? `Yes, at ${new Date(booking.checked_in_at as string).toLocaleString()} by ${booking.checked_in_by_name ?? 'staff'}`
                  : 'Not yet'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Feedback</CardTitle>
          {canFeedback && !booking.feedback && <AddFeedbackDialog bookingId={booking.id} />}
        </CardHeader>
        <CardContent>
          {booking.feedback ? (
            <div className="flex flex-col gap-1 text-sm">
              <p className="font-medium text-foreground">{booking.feedback.rating} / 5</p>
              {booking.feedback.comments && <p className="text-foreground">{booking.feedback.comments}</p>}
              {booking.feedback.interested_in_purchasing && (
                <p className="text-accent">Interested in purchasing</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No feedback recorded yet.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Follow-ups</CardTitle>
          {canFollowUp && <AddFollowUpDialog bookingId={booking.id} />}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">SN</TableHead>
                <TableHead>Due date</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Assigned to</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {booking.follow_ups.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No follow-ups yet.
                  </TableCell>
                </TableRow>
              )}
              {booking.follow_ups.map((followUp, index) => (
                <FollowUpRow
                  key={followUp.id}
                  bookingId={booking.id}
                  followUpId={followUp.id}
                  index={index}
                  dueDate={followUp.due_date}
                  status={followUp.status}
                  notes={followUp.notes}
                  assignedToName={followUp.assigned_to_name}
                  canManage={canFollowUp}
                />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {booking.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-foreground">{booking.notes}</CardContent>
        </Card>
      )}
    </div>
  )
}
