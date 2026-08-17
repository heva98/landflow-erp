import { apiClient } from '@/lib/api-client'

import type {
  Beacon,
  BeaconInput,
  PaginatedResponse,
  RoadReserve,
  RoadReserveInput,
  Subdivision,
  SubdivisionInput,
  SubdivisionPlot,
  SubdivisionPlotInput,
  Survey,
  SurveyCompany,
  SurveyCompanyInput,
  SurveyDocument,
  SurveyDocumentInput,
  SurveyInput,
  SurveyListParams,
  Surveyor,
  SurveyorInput,
  UtilityReserve,
  UtilityReserveInput,
} from '../types'

// -- Survey companies ---------------------------------------------------------

export async function fetchSurveyCompanies(params: { search?: string } = {}) {
  const response = await apiClient.get<PaginatedResponse<SurveyCompany>>('/survey-companies/', { params })
  return response.data
}

export async function createSurveyCompany(input: SurveyCompanyInput) {
  const response = await apiClient.post<SurveyCompany>('/survey-companies/', input)
  return response.data
}

// -- Surveyors ------------------------------------------------------------------

export async function fetchSurveyors(params: { company?: string; search?: string } = {}) {
  const response = await apiClient.get<PaginatedResponse<Surveyor>>('/surveyors/', { params })
  return response.data
}

export async function createSurveyor(input: SurveyorInput) {
  const response = await apiClient.post<Surveyor>('/surveyors/', input)
  return response.data
}

// -- Surveys --------------------------------------------------------------------

export async function fetchSurveys(params: SurveyListParams = {}) {
  const response = await apiClient.get<PaginatedResponse<Survey>>('/surveys/', { params })
  return response.data
}

export async function fetchSurvey(id: string) {
  const response = await apiClient.get<Survey>(`/surveys/${id}/`)
  return response.data
}

export async function createSurvey(input: SurveyInput) {
  const response = await apiClient.post<Survey>('/surveys/', input)
  return response.data
}

export async function startSurvey(id: string) {
  const response = await apiClient.post<Survey>(`/surveys/${id}/start/`)
  return response.data
}

export async function completeSurvey(id: string, areaSurveyedSqm?: string) {
  const response = await apiClient.post<Survey>(`/surveys/${id}/complete/`, { area_surveyed_sqm: areaSurveyedSqm })
  return response.data
}

export async function approveSurvey(id: string) {
  const response = await apiClient.post<Survey>(`/surveys/${id}/approve/`)
  return response.data
}

export async function rejectSurvey(id: string, rejection_reason?: string) {
  const response = await apiClient.post<Survey>(`/surveys/${id}/reject/`, { rejection_reason })
  return response.data
}

// -- Beacons --------------------------------------------------------------------

export async function createBeacon(input: BeaconInput) {
  const response = await apiClient.post<Beacon>('/survey-beacons/', input)
  return response.data
}

// -- Survey documents -------------------------------------------------------------

export async function createSurveyDocument(input: SurveyDocumentInput) {
  const formData = new FormData()
  formData.append('survey', input.survey)
  formData.append('document_type', input.document_type)
  formData.append('description', input.description ?? '')
  formData.append('file', input.file)
  const response = await apiClient.post<SurveyDocument>('/survey-documents/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

// -- Subdivisions -----------------------------------------------------------------

export async function fetchSubdivisions(params: { survey?: string } = {}) {
  const response = await apiClient.get<PaginatedResponse<Subdivision>>('/subdivisions/', { params })
  return response.data
}

export async function fetchSubdivision(id: string) {
  const response = await apiClient.get<Subdivision>(`/subdivisions/${id}/`)
  return response.data
}

export async function createSubdivision(input: SubdivisionInput) {
  const response = await apiClient.post<Subdivision>('/subdivisions/', input)
  return response.data
}

export async function submitSubdivision(id: string) {
  const response = await apiClient.post<Subdivision>(`/subdivisions/${id}/submit/`)
  return response.data
}

export async function approveSubdivision(id: string) {
  const response = await apiClient.post<Subdivision>(`/subdivisions/${id}/approve/`)
  return response.data
}

export async function rejectSubdivision(id: string) {
  const response = await apiClient.post<Subdivision>(`/subdivisions/${id}/reject/`)
  return response.data
}

// -- Subdivision plots --------------------------------------------------------------

export async function createSubdivisionPlot(input: SubdivisionPlotInput) {
  const response = await apiClient.post<SubdivisionPlot>('/subdivision-plots/', input)
  return response.data
}

export async function convertSubdivisionPlotToPlot(id: string) {
  const response = await apiClient.post<SubdivisionPlot>(`/subdivision-plots/${id}/convert_to_plot/`)
  return response.data
}

// -- Road & utility reserves -----------------------------------------------------------

export async function createRoadReserve(input: RoadReserveInput) {
  const response = await apiClient.post<RoadReserve>('/subdivision-roads/', input)
  return response.data
}

export async function createUtilityReserve(input: UtilityReserveInput) {
  const response = await apiClient.post<UtilityReserve>('/subdivision-utilities/', input)
  return response.data
}
