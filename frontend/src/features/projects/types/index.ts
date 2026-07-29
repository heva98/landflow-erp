export const PROJECT_STATUSES = ['planning', 'development', 'selling', 'completed'] as const
export type ProjectStatus = (typeof PROJECT_STATUSES)[number]

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  planning: 'Planning',
  development: 'Development',
  selling: 'Selling',
  completed: 'Completed',
}

export interface ProjectOwner {
  id: string
  email: string
  first_name: string
  last_name: string
}

export interface Project {
  id: string
  name: string
  status: ProjectStatus
  description: string
  owner: ProjectOwner | null
  location: string
  latitude: string | null
  longitude: string | null
  master_plan_url: string
  map_url: string
  image_urls: string[]
  video_urls: string[]
  nearby_services: string[]
  total_area_sqm: string
  // Omitted entirely by the API for users without view_project_financials.
  acquisition_cost?: string
  development_cost?: string
  expected_revenue?: string
  total_cost?: string
  roi_percent?: string | null
  start_date: string | null
  expected_completion_date: string | null
  created_at: string
  updated_at: string
}

export interface ProjectListParams {
  status?: ProjectStatus
  search?: string
  page?: number
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface ProjectInput {
  name: string
  status: ProjectStatus
  location: string
  description: string
  owner_id: string | null
  master_plan_url: string
  total_area_sqm: number
  acquisition_cost: number
  development_cost: number
  expected_revenue: number
  start_date: string | null
  expected_completion_date: string | null
}
