import { apiClient } from '@/lib/api-client'

import type {
  Bus,
  BusInput,
  Driver,
  DriverInput,
  FeedbackInput,
  FollowUp,
  FollowUpInput,
  PaginatedResponse,
  PhotoInput,
  SiteVisit,
  SiteVisitBooking,
  BookingInput,
  SiteVisitInput,
  SiteVisitListParams,
  VisitFeedback,
  VisitPhoto,
} from '../types'

// -- Drivers --------------------------------------------------------------------

export async function fetchDrivers(params: { search?: string; is_active?: boolean } = {}) {
  const response = await apiClient.get<PaginatedResponse<Driver>>('/drivers/', { params })
  return response.data
}

export async function createDriver(input: DriverInput) {
  const response = await apiClient.post<Driver>('/drivers/', input)
  return response.data
}

// -- Buses ------------------------------------------------------------------------

export async function fetchBuses(params: { search?: string; is_active?: boolean } = {}) {
  const response = await apiClient.get<PaginatedResponse<Bus>>('/buses/', { params })
  return response.data
}

export async function createBus(input: BusInput) {
  const response = await apiClient.post<Bus>('/buses/', input)
  return response.data
}

// -- Site visits --------------------------------------------------------------------

export async function fetchSiteVisits(params: SiteVisitListParams = {}) {
  const response = await apiClient.get<PaginatedResponse<SiteVisit>>('/site-visits/', { params })
  return response.data
}

export async function fetchSiteVisit(id: string) {
  const response = await apiClient.get<SiteVisit>(`/site-visits/${id}/`)
  return response.data
}

export async function createSiteVisit(input: SiteVisitInput) {
  const response = await apiClient.post<SiteVisit>('/site-visits/', input)
  return response.data
}

export async function startSiteVisit(id: string) {
  const response = await apiClient.post<SiteVisit>(`/site-visits/${id}/start/`)
  return response.data
}

export async function completeSiteVisit(id: string) {
  const response = await apiClient.post<SiteVisit>(`/site-visits/${id}/complete/`)
  return response.data
}

export async function cancelSiteVisit(id: string) {
  const response = await apiClient.post<SiteVisit>(`/site-visits/${id}/cancel/`)
  return response.data
}

// -- Bookings ---------------------------------------------------------------------

export async function fetchBooking(id: string) {
  const response = await apiClient.get<SiteVisitBooking>(`/site-visit-bookings/${id}/`)
  return response.data
}

export async function createBooking(input: BookingInput) {
  const response = await apiClient.post<SiteVisitBooking>('/site-visit-bookings/', input)
  return response.data
}

export async function confirmBooking(id: string) {
  const response = await apiClient.post<SiteVisitBooking>(`/site-visit-bookings/${id}/confirm/`)
  return response.data
}

export async function cancelBooking(id: string) {
  const response = await apiClient.post<SiteVisitBooking>(`/site-visit-bookings/${id}/cancel/`)
  return response.data
}

export async function markBookingNoShow(id: string) {
  const response = await apiClient.post<SiteVisitBooking>(`/site-visit-bookings/${id}/mark_no_show/`)
  return response.data
}

export async function checkInByToken(token: string) {
  const response = await apiClient.post<SiteVisitBooking>('/site-visit-bookings/check_in/', { token })
  return response.data
}

// -- Feedback, photos, follow-ups --------------------------------------------------

export async function createFeedback(input: FeedbackInput) {
  const response = await apiClient.post<VisitFeedback>('/site-visit-feedback/', input)
  return response.data
}

export async function createPhoto(input: PhotoInput) {
  const formData = new FormData()
  formData.append('site_visit', input.site_visit)
  formData.append('caption', input.caption ?? '')
  formData.append('file', input.file)
  const response = await apiClient.post<VisitPhoto>('/site-visit-photos/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export async function createFollowUp(input: FollowUpInput) {
  const response = await apiClient.post<FollowUp>('/site-visit-follow-ups/', input)
  return response.data
}

export async function markFollowUpDone(id: string) {
  const response = await apiClient.post<FollowUp>(`/site-visit-follow-ups/${id}/mark_done/`)
  return response.data
}
