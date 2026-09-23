export interface InventoryPlotRow {
  project: string
  plot_number: string
  block: string
  street: string
  area_sqm: string
  price: string
  final_price: string
  owner: string
}

export interface InventoryPlotSummary {
  count: number
  total_area_sqm: string
  total_price: string
}

export interface InventoryPlotReport {
  rows: InventoryPlotRow[]
  summary: InventoryPlotSummary
}

export interface AvailableAreaRow {
  project: string
  available_plot_count: number
  available_area_sqm: string
}

export interface AvailableAreaReport {
  rows: AvailableAreaRow[]
  summary: { count: number; total_area_sqm: string }
}

export interface FutureProjectRow {
  project: string
  status: string
  location: string
  total_area_sqm: string
  plot_count: number
  start_date: string | null
  expected_completion_date: string | null
}

export interface FutureProjectsReport {
  rows: FutureProjectRow[]
  summary: { count: number; total_area_sqm: string }
}

export interface InventoryStat {
  count: number
  area_sqm: string
}

export interface InventoryOverview {
  unsold: InventoryStat
  reserved: InventoryStat
  transferred: InventoryStat
  future_projects_count: number
}

export interface InventoryParams {
  project?: string
}
