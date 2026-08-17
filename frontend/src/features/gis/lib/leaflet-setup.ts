import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// Vite rewrites asset URLs at build time, which breaks Leaflet's own lookup
// of its default marker images — point it at the bundled URLs instead. Must
// run once before any <Marker> renders; importing this module is enough.
type IconDefaultWithPrivateMethod = typeof L.Icon.Default.prototype & { _getIconUrl?: unknown }
delete (L.Icon.Default.prototype as IconDefaultWithPrivateMethod)._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})
