import { ArrowLeft, Pencil } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { ReservePlotDialog } from '@/features/reservations/components/reserve-plot-dialog'
import { canCreateReservations } from '@/features/reservations/lib/permissions'
import { canCreateSales } from '@/features/sales/lib/permissions'
import { formatTZS } from '@/lib/utils'

import { PlotStatusBadge } from '../components/plot-status-badge'
import { usePlotQuery } from '../hooks/use-plots'
import { canEditPlots } from '../lib/permissions'

export function PlotDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const canEdit = canEditPlots(user?.permissions)
  const canReserve = canCreateReservations(user?.permissions)
  const canSell = canCreateSales(user?.permissions)
  const { data: plot, isLoading, isError } = usePlotQuery(id)

  if (isLoading) {
    return <p className="text-muted-foreground">Loading plot…</p>
  }

  if (isError || !plot) {
    return <p className="text-destructive">Plot not found.</p>
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/plots')} aria-label="Back to plots">
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{plot.plot_number}</h1>
            <p className="text-sm text-muted-foreground">
              {plot.project_name}
              {(plot.block || plot.street) && ` · ${[plot.block, plot.street].filter(Boolean).join(' / ')}`}
            </p>
          </div>
          <PlotStatusBadge status={plot.status} />
        </div>
        <div className="flex items-center gap-2">
          {canReserve && plot.status === 'available' && (
            <ReservePlotDialog plotId={plot.id} plotNumber={plot.plot_number} />
          )}
          {canSell && plot.status === 'available' && (
            <Button asChild variant="outline">
              <Link to={`/sales/new?plot=${plot.id}`}>Sell</Link>
            </Button>
          )}
          {canEdit && (
            <Button asChild variant="outline">
              <Link to={`/plots/${plot.id}/edit`}>
                <Pencil /> Edit
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Area</CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-semibold text-foreground">
            {Number(plot.area_sqm).toLocaleString()} sqm
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Price</CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-semibold text-foreground">{formatTZS(plot.price)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Final price</CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-semibold text-foreground">
            {formatTZS(plot.final_price)}
            {Number(plot.discount) > 0 && (
              <p className="mt-1 text-xs font-normal text-muted-foreground">
                {formatTZS(plot.discount)} discount applied
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">Google Maps</p>
            {plot.google_maps_url ? (
              <a
                href={plot.google_maps_url}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-primary underline underline-offset-4"
              >
                View location
              </a>
            ) : (
              <p className="font-medium text-foreground">—</p>
            )}
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Owner</p>
            <p className="font-medium text-foreground">{plot.owner_name ?? '—'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
