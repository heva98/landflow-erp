import { CircleMarker, Polygon, Popup } from 'react-leaflet'
import { Link } from 'react-router-dom'

import { PlotStatusBadge } from '@/features/plots/components/plot-status-badge'
import type { Plot } from '@/features/plots/types'
import { formatTZS } from '@/lib/utils'

import { isGeoJsonPolygon, polygonToLatLngs, toLatLngExpression } from '../lib/geo'
import { PLOT_STATUS_COLORS } from '../lib/plot-colors'

function PlotPopup({ plot }: { plot: Plot }) {
  return (
    <div className="flex flex-col gap-1.5 text-sm">
      <p className="font-semibold text-foreground">
        {plot.project_name} · {plot.plot_number}
      </p>
      <PlotStatusBadge status={plot.status} />
      <p>{Number(plot.area_sqm).toLocaleString()} sqm</p>
      <p>{formatTZS(plot.final_price)}</p>
      <Link to={`/plots/${plot.id}`} className="text-primary underline underline-offset-4">
        View plot
      </Link>
    </div>
  )
}

/** Renders each plot as its drawn polygon when available, or a colored point at its coordinates otherwise. */
export function PlotsLayer({ plots }: { plots: Plot[] }) {
  return (
    <>
      {plots.map((plot) => {
        const color = PLOT_STATUS_COLORS[plot.status]

        if (isGeoJsonPolygon(plot.polygon_geojson)) {
          return (
            <Polygon
              key={plot.id}
              positions={polygonToLatLngs(plot.polygon_geojson)}
              pathOptions={{ color, fillColor: color, fillOpacity: 0.4, weight: 2 }}
            >
              <Popup>
                <PlotPopup plot={plot} />
              </Popup>
            </Polygon>
          )
        }

        if (plot.latitude && plot.longitude) {
          return (
            <CircleMarker
              key={plot.id}
              center={toLatLngExpression(plot.latitude, plot.longitude)}
              radius={8}
              pathOptions={{ color, fillColor: color, fillOpacity: 0.8, weight: 1 }}
            >
              <Popup>
                <PlotPopup plot={plot} />
              </Popup>
            </CircleMarker>
          )
        }

        return null
      })}
    </>
  )
}
