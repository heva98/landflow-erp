import type { LatLngExpression, LatLngTuple } from 'leaflet'

/** GeoJSON Polygon, as stored on Plot.polygon_geojson: { type, coordinates: [[[lng, lat], ...]] }. */
interface GeoJsonPolygon {
  type: 'Polygon'
  coordinates: number[][][]
}

export function isGeoJsonPolygon(value: unknown): value is GeoJsonPolygon {
  if (!value || typeof value !== 'object') return false
  const candidate = value as { type?: unknown; coordinates?: unknown }
  return candidate.type === 'Polygon' && Array.isArray(candidate.coordinates) && candidate.coordinates.length > 0
}

/** GeoJSON stores [lng, lat]; Leaflet wants [lat, lng]. */
export function polygonToLatLngs(polygon: GeoJsonPolygon): LatLngTuple[] {
  const ring = polygon.coordinates[0] ?? []
  return ring.map(([lng, lat]) => [lat, lng])
}

export function latLngsToPolygon(points: LatLngTuple[]): GeoJsonPolygon {
  const ring = points.map(([lat, lng]) => [lng, lat])
  // GeoJSON polygons must be closed rings (first point repeated last).
  const [firstLng, firstLat] = ring[0] ?? [0, 0]
  ring.push([firstLng, firstLat])
  return { type: 'Polygon', coordinates: [ring] }
}

export function formatDistance(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(2)} km`
  return `${meters.toFixed(0)} m`
}

/**
 * Approximate polygon area in square meters via the shoelace formula over an
 * equirectangular projection — accurate enough at plot/project scale, not
 * meant for large regions.
 */
export function polygonAreaSqm(points: LatLngTuple[]): number {
  if (points.length < 3) return 0
  const earthRadius = 6378137
  const originLat = (points[0][0] * Math.PI) / 180
  const toXY = ([lat, lng]: LatLngTuple) => {
    const x = (lng * Math.PI * earthRadius * Math.cos(originLat)) / 180
    const y = (lat * Math.PI * earthRadius) / 180
    return [x, y]
  }
  const xy = points.map(toXY)
  let sum = 0
  for (let i = 0; i < xy.length; i++) {
    const [x1, y1] = xy[i]
    const [x2, y2] = xy[(i + 1) % xy.length]
    sum += x1 * y2 - x2 * y1
  }
  return Math.abs(sum / 2)
}

export function formatArea(sqm: number): string {
  if (sqm >= 10000) return `${(sqm / 10000).toFixed(2)} ha`
  return `${sqm.toFixed(0)} sqm`
}

export function toLatLngExpression(lat: string | number, lng: string | number): LatLngExpression {
  return [Number(lat), Number(lng)]
}
