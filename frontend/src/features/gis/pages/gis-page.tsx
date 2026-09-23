import '../lib/leaflet-setup'
import 'leaflet/dist/leaflet.css'

import L from 'leaflet'
import type { LatLngExpression, LatLngTuple } from 'leaflet'
import { useMemo, useState } from 'react'
import { MapContainer, Polygon, Polyline, TileLayer } from 'react-leaflet'

import { useAuth } from '@/features/auth/hooks/use-auth'
import { canEditPlots } from '@/features/plots/lib/permissions'
import type { Plot } from '@/features/plots/types'

import { DrawPanel } from '../components/draw-panel'
import { FitBoundsController, FlyToController } from '../components/fly-to-controller'
import { MapClickHandler } from '../components/map-click-handler'
import { MapLegend } from '../components/map-legend'
import { MeasurePanel } from '../components/measure-panel'
import { PlotSearch } from '../components/plot-search'
import { PlotsLayer } from '../components/plots-layer'
import { ProjectsLayer } from '../components/projects-layer'
import { useMapPlotsQuery, useMapProjectsQuery, useSavePlotBoundaryMutation } from '../hooks/use-gis'
import { isGeoJsonPolygon, latLngsToPolygon, polygonAreaSqm, polygonToLatLngs, toLatLngExpression } from '../lib/geo'

const DAR_ES_SALAAM: LatLngExpression = [-6.7924, 39.2083]

type ActiveTool = 'none' | 'measure' | 'draw'

export function GisPage() {
  const { user } = useAuth()
  const canEdit = canEditPlots(user?.permissions)
  const { data: plots = [] } = useMapPlotsQuery()
  const { data: projects = [] } = useMapProjectsQuery()
  const saveBoundary = useSavePlotBoundaryMutation()

  const [activeTool, setActiveTool] = useState<ActiveTool>('none')
  const [measurePoints, setMeasurePoints] = useState<LatLngTuple[]>([])
  const [drawPoints, setDrawPoints] = useState<LatLngTuple[]>([])
  const [drawTarget, setDrawTarget] = useState<Plot | null>(null)
  const [flyTarget, setFlyTarget] = useState<LatLngExpression | null>(null)

  const boundsPoints = useMemo<LatLngExpression[]>(() => {
    const points: LatLngExpression[] = []
    for (const project of projects) {
      if (project.latitude && project.longitude) points.push(toLatLngExpression(project.latitude, project.longitude))
    }
    for (const plot of plots) {
      if (plot.latitude && plot.longitude) points.push(toLatLngExpression(plot.latitude, plot.longitude))
      else if (isGeoJsonPolygon(plot.polygon_geojson)) points.push(...polygonToLatLngs(plot.polygon_geojson))
    }
    return points
  }, [plots, projects])

  const measureDistanceMeters = useMemo(() => {
    let total = 0
    for (let i = 1; i < measurePoints.length; i++) {
      total += L.latLng(measurePoints[i - 1]).distanceTo(L.latLng(measurePoints[i]))
    }
    return total
  }, [measurePoints])

  const drawAreaSqm = useMemo(() => polygonAreaSqm(drawPoints), [drawPoints])

  function handleMapClick(point: LatLngTuple) {
    if (activeTool === 'measure') setMeasurePoints((prev) => [...prev, point])
    else if (activeTool === 'draw') setDrawPoints((prev) => [...prev, point])
  }

  function toggleMeasure() {
    setActiveTool((prev) => (prev === 'measure' ? 'none' : 'measure'))
    setMeasurePoints([])
  }

  function toggleDraw() {
    setActiveTool((prev) => (prev === 'draw' ? 'none' : 'draw'))
    setDrawPoints([])
    setDrawTarget(null)
  }

  async function handleSaveBoundary() {
    if (!drawTarget || drawPoints.length < 3) return
    await saveBoundary.mutateAsync({ plotId: drawTarget.id, polygonGeojson: latLngsToPolygon(drawPoints) })
    setDrawPoints([])
    setDrawTarget(null)
    setActiveTool('none')
  }

  function handleSearchSelect(plot: Plot) {
    if (plot.latitude && plot.longitude) {
      setFlyTarget(toLatLngExpression(plot.latitude, plot.longitude))
    } else if (isGeoJsonPolygon(plot.polygon_geojson)) {
      setFlyTarget(polygonToLatLngs(plot.polygon_geojson)[0])
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4">
      <h1 className="text-2xl font-semibold text-foreground">GIS Map</h1>

      <div className="relative flex-1 overflow-hidden rounded-xl ring-1 ring-foreground/10">
        <MapContainer
          center={DAR_ES_SALAAM}
          zoom={12}
          scrollWheelZoom
          className="h-full w-full"
          style={{ cursor: activeTool === 'none' ? undefined : 'crosshair' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <FitBoundsController points={boundsPoints} />
          <FlyToController target={flyTarget} />
          <MapClickHandler onClick={activeTool === 'none' ? null : handleMapClick} />

          <ProjectsLayer projects={projects} />
          <PlotsLayer plots={plots} />

          {measurePoints.length > 1 && (
            <Polyline positions={measurePoints} pathOptions={{ color: 'var(--color-primary)', weight: 3 }} />
          )}
          {drawPoints.length > 1 && (
            <Polygon
              positions={drawPoints}
              pathOptions={{ color: 'var(--color-primary)', fillOpacity: 0.15, weight: 2, dashArray: '6 4' }}
            />
          )}
        </MapContainer>

        <div className="pointer-events-none absolute inset-0 z-[1000] flex flex-col justify-between p-4">
          <div className="pointer-events-auto flex flex-wrap items-start gap-2">
            <PlotSearch plots={plots} onSelect={handleSearchSelect} />
            <MeasurePanel
              active={activeTool === 'measure'}
              pointCount={measurePoints.length}
              distanceMeters={measureDistanceMeters}
              onToggle={toggleMeasure}
              onClear={() => setMeasurePoints([])}
            />
            <DrawPanel
              active={activeTool === 'draw'}
              onToggle={toggleDraw}
              plots={plots}
              targetPlot={drawTarget}
              onPickTarget={setDrawTarget}
              onClearTarget={() => setDrawTarget(null)}
              pointCount={drawPoints.length}
              areaSqm={drawAreaSqm}
              onUndo={() => setDrawPoints((prev) => prev.slice(0, -1))}
              onClear={() => setDrawPoints([])}
              onSave={handleSaveBoundary}
              isSaving={saveBoundary.isPending}
              canEdit={canEdit}
            />
          </div>
          <div className="pointer-events-auto self-start">
            <MapLegend />
          </div>
        </div>
      </div>
    </div>
  )
}
