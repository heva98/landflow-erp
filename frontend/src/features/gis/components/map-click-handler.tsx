import type { LatLngTuple } from 'leaflet'
import { useMapEvents } from 'react-leaflet'

/** Invisible — forwards map clicks to whichever tool is currently active. */
export function MapClickHandler({ onClick }: { onClick: ((point: LatLngTuple) => void) | null }) {
  useMapEvents({
    click(event) {
      onClick?.([event.latlng.lat, event.latlng.lng])
    },
  })
  return null
}
