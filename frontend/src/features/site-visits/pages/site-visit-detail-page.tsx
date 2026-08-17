import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/features/auth/hooks/use-auth'

import { AddBookingDialog } from '../components/add-booking-dialog'
import { AddPhotoDialog } from '../components/add-photo-dialog'
import { BookingStatusBadge, SiteVisitStatusBadge } from '../components/status-badges'
import { SiteVisitWorkflowActions } from '../components/site-visit-workflow-actions'
import { useSiteVisitQuery } from '../hooks/use-site-visits'
import { canAddPhotos, canManageBookings } from '../lib/permissions'

const apiBaseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1'
const mediaOrigin = apiBaseURL.replace(/\/api\/v1\/?$/, '')

function resolveUrl(path: string) {
  return path.startsWith('http') ? path : `${mediaOrigin}${path}`
}

export function SiteVisitDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const canBook = canManageBookings(user?.permissions)
  const canPhoto = canAddPhotos(user?.permissions)
  const { data: visit, isLoading, isError } = useSiteVisitQuery(id)

  if (isLoading) {
    return <p className="text-muted-foreground">Loading site visit…</p>
  }

  if (isError || !visit) {
    return <p className="text-destructive">Site visit not found.</p>
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/site-visits')} aria-label="Back to site visits">
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{visit.reference_number}</h1>
            <p className="text-sm text-muted-foreground">
              {visit.project_name} · {visit.visit_date}
            </p>
          </div>
          <SiteVisitStatusBadge status={visit.status} />
        </div>
        <SiteVisitWorkflowActions siteVisit={visit} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Meeting point</CardTitle>
          </CardHeader>
          <CardContent className="text-sm font-semibold text-foreground">{visit.meeting_point || '—'}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Departure time</CardTitle>
          </CardHeader>
          <CardContent className="text-sm font-semibold text-foreground">{visit.departure_time ?? '—'}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Bus</CardTitle>
          </CardHeader>
          <CardContent className="text-sm font-semibold text-foreground">{visit.bus_registration ?? 'Not assigned'}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Attendance</CardTitle>
          </CardHeader>
          <CardContent className="text-sm font-semibold text-foreground">
            {visit.checked_in_count} / {visit.booking_count} checked in
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Bookings</CardTitle>
          {canBook && <AddBookingDialog siteVisitId={visit.id} />}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lead</TableHead>
                <TableHead>Guests</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Checked in</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {visit.bookings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No bookings yet.
                  </TableCell>
                </TableRow>
              )}
              {visit.bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium text-foreground">
                    <Link to={`/site-visits/bookings/${booking.id}`} className="hover:underline">
                      {booking.lead_name}
                    </Link>
                  </TableCell>
                  <TableCell>{booking.guest_count}</TableCell>
                  <TableCell>
                    <BookingStatusBadge status={booking.status} />
                  </TableCell>
                  <TableCell>{booking.is_checked_in ? 'Yes' : 'No'}</TableCell>
                  <TableCell>
                    <Link
                      to={`/site-visits/bookings/${booking.id}`}
                      className="text-sm text-primary underline underline-offset-4"
                    >
                      View
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Photo gallery</CardTitle>
          {canPhoto && <AddPhotoDialog siteVisitId={visit.id} />}
        </CardHeader>
        <CardContent>
          {visit.photos.length === 0 ? (
            <p className="text-sm text-muted-foreground">No photos uploaded yet.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {visit.photos.map((photo) => (
                <a key={photo.id} href={resolveUrl(photo.file)} target="_blank" rel="noreferrer" className="group">
                  <img
                    src={resolveUrl(photo.file)}
                    alt={photo.caption || 'Site visit photo'}
                    className="aspect-square w-full rounded-lg object-cover ring-1 ring-foreground/10 transition group-hover:opacity-80"
                  />
                  {photo.caption && <p className="mt-1 truncate text-xs text-muted-foreground">{photo.caption}</p>}
                </a>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {visit.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-foreground">{visit.notes}</CardContent>
        </Card>
      )}
    </div>
  )
}
