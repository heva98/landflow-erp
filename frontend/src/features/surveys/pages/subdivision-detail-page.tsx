import { ArrowLeft } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/features/auth/hooks/use-auth'

import { AddRoadReserveDialog } from '../components/add-road-reserve-dialog'
import { AddSubdivisionPlotDialog } from '../components/add-subdivision-plot-dialog'
import { AddUtilityReserveDialog } from '../components/add-utility-reserve-dialog'
import { SubdivisionStatusBadge } from '../components/status-badges'
import { SubdivisionWorkflowActions } from '../components/subdivision-workflow-actions'
import { useConvertSubdivisionPlotMutation, useSubdivisionBySurveyQuery } from '../hooks/use-surveys'
import { canConvertSubdivisionPlots, canManageSurveys } from '../lib/permissions'
import { LAND_USE_LABELS, ROAD_TYPE_LABELS, UTILITY_TYPE_LABELS } from '../types'

export function SubdivisionDetailPage() {
  const { id: surveyId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const canManage = canManageSurveys(user?.permissions)
  const canConvert = canConvertSubdivisionPlots(user?.permissions)
  const { data: subdivision, isLoading, isError } = useSubdivisionBySurveyQuery(surveyId)
  const convertPlot = useConvertSubdivisionPlotMutation()

  if (isLoading) {
    return <p className="text-muted-foreground">Loading subdivision…</p>
  }

  if (isError || !subdivision) {
    return <p className="text-destructive">Subdivision not found.</p>
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/surveys/${surveyId}`)} aria-label="Back to survey">
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{subdivision.plan_number || 'Subdivision'}</h1>
            <p className="text-sm text-muted-foreground">{subdivision.survey_reference} · {subdivision.project_name}</p>
          </div>
          <SubdivisionStatusBadge status={subdivision.status} />
        </div>
        <SubdivisionWorkflowActions subdivision={subdivision} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Gross area</CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-semibold text-foreground">
            {subdivision.gross_area_sqm ? `${Number(subdivision.gross_area_sqm).toLocaleString()} sqm` : '—'}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Road reserve</CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-semibold text-foreground">
            {Number(subdivision.road_reserve_area_sqm).toLocaleString()} sqm
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Utility reserve</CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-semibold text-foreground">
            {Number(subdivision.utility_reserve_area_sqm).toLocaleString()} sqm
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Net saleable area</CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-semibold text-foreground">
            {subdivision.net_saleable_area_sqm ? `${Number(subdivision.net_saleable_area_sqm).toLocaleString()} sqm` : '—'}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Planned plots</CardTitle>
          {canManage && <AddSubdivisionPlotDialog subdivisionId={subdivision.id} />}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">SN</TableHead>
                <TableHead>Plot number</TableHead>
                <TableHead>Block</TableHead>
                <TableHead>Area (sqm)</TableHead>
                <TableHead>Land use</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {subdivision.planned_plots.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No planned plots yet.
                  </TableCell>
                </TableRow>
              )}
              {subdivision.planned_plots.map((plot, index) => (
                <TableRow key={plot.id}>
                  <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                  <TableCell className="font-medium text-foreground">{plot.plot_number}</TableCell>
                  <TableCell>{plot.block || '—'}</TableCell>
                  <TableCell>{Number(plot.area_sqm).toLocaleString()}</TableCell>
                  <TableCell>{LAND_USE_LABELS[plot.land_use]}</TableCell>
                  <TableCell>
                    <Badge variant={plot.is_converted ? 'success' : 'secondary'}>
                      {plot.is_converted ? 'Converted' : 'Planned'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {canConvert && subdivision.status === 'approved' && !plot.is_converted && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={convertPlot.isPending}
                        onClick={() => convertPlot.mutate(plot.id)}
                      >
                        Convert to plot
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Road reserves</CardTitle>
          {canManage && <AddRoadReserveDialog subdivisionId={subdivision.id} />}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">SN</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Width (m)</TableHead>
                <TableHead>Length (m)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subdivision.roads.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No road reserves yet.
                  </TableCell>
                </TableRow>
              )}
              {subdivision.roads.map((road, index) => (
                <TableRow key={road.id}>
                  <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                  <TableCell className="font-medium text-foreground">{road.name}</TableCell>
                  <TableCell>{ROAD_TYPE_LABELS[road.road_type]}</TableCell>
                  <TableCell>{road.width_m ?? '—'}</TableCell>
                  <TableCell>{road.length_m ?? '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Utility reserves</CardTitle>
          {canManage && <AddUtilityReserveDialog subdivisionId={subdivision.id} />}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">SN</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Area (sqm)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subdivision.utilities.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No utility reserves yet.
                  </TableCell>
                </TableRow>
              )}
              {subdivision.utilities.map((utility, index) => (
                <TableRow key={utility.id}>
                  <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                  <TableCell className="font-medium text-foreground">{UTILITY_TYPE_LABELS[utility.utility_type]}</TableCell>
                  <TableCell>{utility.description || '—'}</TableCell>
                  <TableCell>{utility.area_sqm ?? '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
