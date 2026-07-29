export const PLOT_STATUSES = ['available', 'reserved', 'sold', 'transferred', 'cancelled'] as const
export type PlotStatus = (typeof PLOT_STATUSES)[number]

export const PLOT_STATUS_LABELS: Record<PlotStatus, string> = {
  available: 'Available',
  reserved: 'Reserved',
  sold: 'Sold',
  transferred: 'Transferred',
  cancelled: 'Cancelled',
}

export interface Plot {
  id: string
  project: string
  project_name: string
  plot_number: string
  block: string
  street: string
  status: PlotStatus
  area_sqm: string
  price: string
  discount: string
  final_price: string
  latitude: string | null
  longitude: string | null
  polygon_geojson: Record<string, unknown>
  corner_coordinates: unknown[]
  google_maps_url: string
  nearby_schools: string[]
  nearby_roads: string[]
  nearby_hospitals: string[]
  image_urls: string[]
  images_360_urls: string[]
  current_owner: string
  created_at: string
  updated_at: string
}

export interface PlotListParams {
  project?: string
  status?: PlotStatus
  min_price?: number
  max_price?: number
  search?: string
  page?: number
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface PlotInput {
  project: string
  plot_number: string
  block: string
  street: string
  status: PlotStatus
  area_sqm: number
  price: number
  discount: number
  google_maps_url: string
  current_owner: string
}
