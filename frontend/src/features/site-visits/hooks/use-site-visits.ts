import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  cancelBooking,
  cancelSiteVisit,
  checkInByToken,
  completeSiteVisit,
  confirmBooking,
  createBooking,
  createBus,
  createDriver,
  createFeedback,
  createFollowUp,
  createPhoto,
  createSiteVisit,
  fetchBooking,
  fetchBuses,
  fetchDrivers,
  fetchSiteVisit,
  fetchSiteVisits,
  markBookingNoShow,
  markFollowUpDone,
  startSiteVisit,
} from '../api/site-visits-api'
import type {
  BookingInput,
  BusInput,
  DriverInput,
  FeedbackInput,
  FollowUpInput,
  PhotoInput,
  SiteVisitInput,
  SiteVisitListParams,
} from '../types'

// -- Drivers --------------------------------------------------------------------

export function useDriversQuery(params: { search?: string; is_active?: boolean } = {}) {
  return useQuery({ queryKey: ['drivers', params], queryFn: () => fetchDrivers(params) })
}

export function useCreateDriverMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: DriverInput) => createDriver(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['drivers'] }),
  })
}

// -- Buses ------------------------------------------------------------------------

export function useBusesQuery(params: { search?: string; is_active?: boolean } = {}) {
  return useQuery({ queryKey: ['buses', params], queryFn: () => fetchBuses(params) })
}

export function useCreateBusMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: BusInput) => createBus(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['buses'] }),
  })
}

// -- Site visits --------------------------------------------------------------------

export function useSiteVisitsQuery(params: SiteVisitListParams = {}) {
  return useQuery({ queryKey: ['site-visits', params], queryFn: () => fetchSiteVisits(params) })
}

export function useSiteVisitQuery(id: string | undefined) {
  return useQuery({
    queryKey: ['site-visits', id],
    queryFn: () => fetchSiteVisit(id as string),
    enabled: Boolean(id),
  })
}

export function useCreateSiteVisitMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: SiteVisitInput) => createSiteVisit(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['site-visits'] }),
  })
}

function useSiteVisitInvalidate(id: string) {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['site-visits', id] })
    queryClient.invalidateQueries({ queryKey: ['site-visits'] })
  }
}

export function useStartSiteVisitMutation(id: string) {
  const invalidate = useSiteVisitInvalidate(id)
  return useMutation({ mutationFn: () => startSiteVisit(id), onSuccess: invalidate })
}

export function useCompleteSiteVisitMutation(id: string) {
  const invalidate = useSiteVisitInvalidate(id)
  return useMutation({ mutationFn: () => completeSiteVisit(id), onSuccess: invalidate })
}

export function useCancelSiteVisitMutation(id: string) {
  const invalidate = useSiteVisitInvalidate(id)
  return useMutation({ mutationFn: () => cancelSiteVisit(id), onSuccess: invalidate })
}

// -- Bookings -------------------------------------------------------------------

export function useBookingQuery(id: string | undefined) {
  return useQuery({
    queryKey: ['site-visit-bookings', id],
    queryFn: () => fetchBooking(id as string),
    enabled: Boolean(id),
  })
}

/** Bookings are always shown nested inside their SiteVisit, so creating/mutating one invalidates the parent visit. */
export function useCreateBookingMutation(siteVisitId: string) {
  const invalidate = useSiteVisitInvalidate(siteVisitId)
  return useMutation({ mutationFn: (input: BookingInput) => createBooking(input), onSuccess: invalidate })
}

function useBookingInvalidate(id: string) {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['site-visit-bookings', id] })
    queryClient.invalidateQueries({ queryKey: ['site-visits'] })
  }
}

export function useConfirmBookingMutation(id: string) {
  const invalidate = useBookingInvalidate(id)
  return useMutation({ mutationFn: () => confirmBooking(id), onSuccess: invalidate })
}

export function useCancelBookingMutation(id: string) {
  const invalidate = useBookingInvalidate(id)
  return useMutation({ mutationFn: () => cancelBooking(id), onSuccess: invalidate })
}

export function useMarkBookingNoShowMutation(id: string) {
  const invalidate = useBookingInvalidate(id)
  return useMutation({ mutationFn: () => markBookingNoShow(id), onSuccess: invalidate })
}

export function useCheckInMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (token: string) => checkInByToken(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-visit-bookings'] })
      queryClient.invalidateQueries({ queryKey: ['site-visits'] })
    },
  })
}

// -- Feedback, photos, follow-ups --------------------------------------------------

export function useCreateFeedbackMutation(bookingId: string) {
  const invalidate = useBookingInvalidate(bookingId)
  return useMutation({ mutationFn: (input: FeedbackInput) => createFeedback(input), onSuccess: invalidate })
}

export function useCreatePhotoMutation(siteVisitId: string) {
  const invalidate = useSiteVisitInvalidate(siteVisitId)
  return useMutation({ mutationFn: (input: PhotoInput) => createPhoto(input), onSuccess: invalidate })
}

export function useCreateFollowUpMutation(bookingId: string) {
  const invalidate = useBookingInvalidate(bookingId)
  return useMutation({ mutationFn: (input: FollowUpInput) => createFollowUp(input), onSuccess: invalidate })
}

export function useMarkFollowUpDoneMutation(bookingId: string) {
  const invalidate = useBookingInvalidate(bookingId)
  return useMutation({ mutationFn: (followUpId: string) => markFollowUpDone(followUpId), onSuccess: invalidate })
}
