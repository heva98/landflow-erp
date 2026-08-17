export const SURVEY_STATUSES = ['scheduled', 'in_progress', 'completed', 'approved', 'rejected'] as const
export type SurveyStatus = (typeof SURVEY_STATUSES)[number]
export const SURVEY_STATUS_LABELS: Record<SurveyStatus, string> = {
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  completed: 'Completed',
  approved: 'Approved',
  rejected: 'Rejected',
}

export const BEACON_TYPES = ['concrete_pillar', 'iron_pin', 'wooden_peg', 'other'] as const
export type BeaconType = (typeof BEACON_TYPES)[number]
export const BEACON_TYPE_LABELS: Record<BeaconType, string> = {
  concrete_pillar: 'Concrete Pillar',
  iron_pin: 'Iron Pin',
  wooden_peg: 'Wooden Peg',
  other: 'Other',
}

export const BEACON_CONDITIONS = ['intact', 'damaged', 'missing'] as const
export type BeaconCondition = (typeof BEACON_CONDITIONS)[number]
export const BEACON_CONDITION_LABELS: Record<BeaconCondition, string> = {
  intact: 'Intact',
  damaged: 'Damaged',
  missing: 'Missing',
}

export const SURVEY_DOCUMENT_TYPES = ['cad', 'gis', 'survey_map', 'report', 'other'] as const
export type SurveyDocumentType = (typeof SURVEY_DOCUMENT_TYPES)[number]
export const SURVEY_DOCUMENT_TYPE_LABELS: Record<SurveyDocumentType, string> = {
  cad: 'CAD File',
  gis: 'GIS File',
  survey_map: 'Survey Map',
  report: 'Survey Report',
  other: 'Other',
}

export const SUBDIVISION_STATUSES = ['draft', 'submitted', 'approved', 'rejected'] as const
export type SubdivisionStatus = (typeof SUBDIVISION_STATUSES)[number]
export const SUBDIVISION_STATUS_LABELS: Record<SubdivisionStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted for Approval',
  approved: 'Approved',
  rejected: 'Rejected',
}

export const LAND_USES = ['residential', 'commercial', 'mixed_use', 'open_space'] as const
export type LandUse = (typeof LAND_USES)[number]
export const LAND_USE_LABELS: Record<LandUse, string> = {
  residential: 'Residential',
  commercial: 'Commercial',
  mixed_use: 'Mixed Use',
  open_space: 'Open Space',
}

export const ROAD_TYPES = ['main', 'secondary', 'access', 'footpath'] as const
export type RoadType = (typeof ROAD_TYPES)[number]
export const ROAD_TYPE_LABELS: Record<RoadType, string> = {
  main: 'Main Road',
  secondary: 'Secondary Road',
  access: 'Access Road',
  footpath: 'Footpath',
}

export const UTILITY_TYPES = ['water', 'electricity', 'sewer', 'storm_drainage', 'telecom', 'other'] as const
export type UtilityType = (typeof UTILITY_TYPES)[number]
export const UTILITY_TYPE_LABELS: Record<UtilityType, string> = {
  water: 'Water',
  electricity: 'Electricity',
  sewer: 'Sewer',
  storm_drainage: 'Storm Drainage',
  telecom: 'Telecom',
  other: 'Other',
}

export interface SurveyCompany {
  id: string
  name: string
  license_number: string
  contact_person: string
  phone: string
  email: string
  address: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Surveyor {
  id: string
  company: string
  company_name: string
  full_name: string
  license_number: string
  phone: string
  email: string
  is_active: boolean
  user: string | null
  created_at: string
  updated_at: string
}

export interface Beacon {
  id: string
  survey: string
  beacon_number: string
  beacon_type: BeaconType
  condition: BeaconCondition
  latitude: string | null
  longitude: string | null
  easting: string | null
  northing: string | null
  elevation_m: string | null
  notes: string
  created_at: string
  updated_at: string
}

export interface SurveyDocument {
  id: string
  survey: string
  document_type: SurveyDocumentType
  file: string
  description: string
  uploaded_by: string | null
  uploaded_by_name: string | null
  created_at: string
  updated_at: string
}

export interface Survey {
  id: string
  reference_number: string
  project: string
  project_name: string
  company: string
  company_name: string
  lead_surveyor: string
  lead_surveyor_name: string
  status: SurveyStatus
  coordinate_system: string
  area_surveyed_sqm: string | null
  scheduled_date: string | null
  completed_date: string | null
  notes: string
  approved_by: string | null
  approved_by_name: string | null
  approved_at: string | null
  rejection_reason: string
  created_by: string | null
  created_by_name: string | null
  has_subdivision: boolean
  beacons: Beacon[]
  documents: SurveyDocument[]
  created_at: string
  updated_at: string
}

export interface RoadReserve {
  id: string
  subdivision: string
  name: string
  road_type: RoadType
  width_m: string | null
  length_m: string | null
  area_sqm: string | null
  path_geojson: Record<string, unknown>
  notes: string
  created_at: string
  updated_at: string
}

export interface UtilityReserve {
  id: string
  subdivision: string
  utility_type: UtilityType
  description: string
  area_sqm: string | null
  path_geojson: Record<string, unknown>
  notes: string
  created_at: string
  updated_at: string
}

export interface SubdivisionPlot {
  id: string
  subdivision: string
  plot_number: string
  block: string
  street: string
  area_sqm: string
  land_use: LandUse
  corner_coordinates: unknown[]
  latitude: string | null
  longitude: string | null
  plot: string | null
  is_converted: boolean
  created_at: string
  updated_at: string
}

export interface Subdivision {
  id: string
  survey: string
  survey_reference: string
  project_name: string
  plan_number: string
  status: SubdivisionStatus
  gross_area_sqm: string | null
  road_reserve_area_sqm: string
  utility_reserve_area_sqm: string
  open_space_area_sqm: string
  net_saleable_area_sqm: string | null
  approved_by: string | null
  approved_by_name: string | null
  approved_at: string | null
  notes: string
  planned_plots: SubdivisionPlot[]
  roads: RoadReserve[]
  utilities: UtilityReserve[]
  created_at: string
  updated_at: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface SurveyListParams {
  project?: string
  company?: string
  status?: SurveyStatus
  search?: string
  page?: number
}

export interface SurveyInput {
  project: string
  company: string
  lead_surveyor: string
  coordinate_system?: string
  scheduled_date?: string | null
  notes?: string
}

export interface SurveyCompanyInput {
  name: string
  license_number?: string
  contact_person?: string
  phone?: string
  email?: string
  address?: string
}

export interface SurveyorInput {
  company: string
  full_name: string
  license_number?: string
  phone?: string
  email?: string
}

export interface BeaconInput {
  survey: string
  beacon_number: string
  beacon_type: BeaconType
  condition: BeaconCondition
  latitude?: number | null
  longitude?: number | null
  easting?: number | null
  northing?: number | null
  notes?: string
}

export interface SurveyDocumentInput {
  survey: string
  document_type: SurveyDocumentType
  description?: string
  file: File
}

export interface SubdivisionInput {
  survey: string
  plan_number?: string
  gross_area_sqm?: number | null
  road_reserve_area_sqm?: number
  utility_reserve_area_sqm?: number
  open_space_area_sqm?: number
  notes?: string
}

export interface SubdivisionPlotInput {
  subdivision: string
  plot_number: string
  block?: string
  street?: string
  area_sqm: number
  land_use: LandUse
}

export interface RoadReserveInput {
  subdivision: string
  name: string
  road_type: RoadType
  width_m?: number | null
  length_m?: number | null
  area_sqm?: number | null
}

export interface UtilityReserveInput {
  subdivision: string
  utility_type: UtilityType
  description?: string
  area_sqm?: number | null
}
