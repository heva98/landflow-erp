import type { LatLngBoundsExpression, LatLngExpression } from 'leaflet'
import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'

/** Invisible — imperatively flies the map to a target whenever it changes. */
export function FlyToController({ target }: { target: LatLngExpression | null }) {
  const map = useMap()

  useEffect(() => {
    if (target) {
      map.flyTo(target, 17)
    }
  }, [map, target])

  return null
}

/** Invisible — fits the map to every point once, the first time data with coordinates arrives. */
export function FitBoundsController({ points }: { points: LatLngExpression[] }) {
  const map = useMap()
  const hasFitted = useRef(false)

  useEffect(() => {
    if (!hasFitted.current && points.length > 0) {
      map.fitBounds(points as LatLngBoundsExpression, { padding: [48, 48], maxZoom: 15 })
      hasFitted.current = true
    }
  }, [map, points])

  return null
}
