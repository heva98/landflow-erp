import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  approveSubdivision,
  approveSurvey,
  completeSurvey,
  convertSubdivisionPlotToPlot,
  createBeacon,
  createRoadReserve,
  createSubdivision,
  createSubdivisionPlot,
  createSurvey,
  createSurveyCompany,
  createSurveyDocument,
  createSurveyor,
  createUtilityReserve,
  fetchSubdivision,
  fetchSubdivisions,
  fetchSurvey,
  fetchSurveyCompanies,
  fetchSurveyors,
  fetchSurveys,
  rejectSubdivision,
  rejectSurvey,
  startSurvey,
  submitSubdivision,
} from '../api/surveys-api'
import type {
  BeaconInput,
  RoadReserveInput,
  SubdivisionInput,
  SubdivisionPlotInput,
  SurveyCompanyInput,
  SurveyDocumentInput,
  SurveyInput,
  SurveyListParams,
  SurveyorInput,
  UtilityReserveInput,
} from '../types'

// -- Survey companies ---------------------------------------------------------

export function useSurveyCompaniesQuery(params: { search?: string } = {}) {
  return useQuery({ queryKey: ['survey-companies', params], queryFn: () => fetchSurveyCompanies(params) })
}

export function useCreateSurveyCompanyMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: SurveyCompanyInput) => createSurveyCompany(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['survey-companies'] }),
  })
}

// -- Surveyors ------------------------------------------------------------------

export function useSurveyorsQuery(params: { company?: string; search?: string } = {}) {
  return useQuery({ queryKey: ['surveyors', params], queryFn: () => fetchSurveyors(params) })
}

export function useCreateSurveyorMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: SurveyorInput) => createSurveyor(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['surveyors'] }),
  })
}

// -- Surveys --------------------------------------------------------------------

export function useSurveysQuery(params: SurveyListParams = {}) {
  return useQuery({ queryKey: ['surveys', params], queryFn: () => fetchSurveys(params) })
}

export function useSurveyQuery(id: string | undefined) {
  return useQuery({
    queryKey: ['surveys', id],
    queryFn: () => fetchSurvey(id as string),
    enabled: Boolean(id),
  })
}

export function useCreateSurveyMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: SurveyInput) => createSurvey(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['surveys'] }),
  })
}

function useSurveyInvalidate(id: string) {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['surveys', id] })
    queryClient.invalidateQueries({ queryKey: ['surveys'] })
  }
}

export function useStartSurveyMutation(id: string) {
  const invalidate = useSurveyInvalidate(id)
  return useMutation({ mutationFn: () => startSurvey(id), onSuccess: invalidate })
}

export function useCompleteSurveyMutation(id: string) {
  const invalidate = useSurveyInvalidate(id)
  return useMutation({
    mutationFn: (areaSurveyedSqm?: string) => completeSurvey(id, areaSurveyedSqm),
    onSuccess: invalidate,
  })
}

export function useApproveSurveyMutation(id: string) {
  const invalidate = useSurveyInvalidate(id)
  return useMutation({ mutationFn: () => approveSurvey(id), onSuccess: invalidate })
}

export function useRejectSurveyMutation(id: string) {
  const invalidate = useSurveyInvalidate(id)
  return useMutation({
    mutationFn: (rejection_reason?: string) => rejectSurvey(id, rejection_reason),
    onSuccess: invalidate,
  })
}

// -- Beacons & documents (invalidate the parent survey, since they're nested in it) ------

export function useCreateBeaconMutation(surveyId: string) {
  const invalidate = useSurveyInvalidate(surveyId)
  return useMutation({ mutationFn: (input: BeaconInput) => createBeacon(input), onSuccess: invalidate })
}

export function useCreateSurveyDocumentMutation(surveyId: string) {
  const invalidate = useSurveyInvalidate(surveyId)
  return useMutation({
    mutationFn: (input: SurveyDocumentInput) => createSurveyDocument(input),
    onSuccess: invalidate,
  })
}

// -- Subdivisions -----------------------------------------------------------------

export function useSubdivisionQuery(id: string | undefined) {
  return useQuery({
    queryKey: ['subdivisions', id],
    queryFn: () => fetchSubdivision(id as string),
    enabled: Boolean(id),
  })
}

/** Looks up the one subdivision for a survey — there's no standalone subdivision list, only this survey-scoped lookup. */
export function useSubdivisionBySurveyQuery(surveyId: string | undefined) {
  return useQuery({
    queryKey: ['subdivisions', 'by-survey', surveyId],
    queryFn: () => fetchSubdivisions({ survey: surveyId }),
    enabled: Boolean(surveyId),
    select: (data) => data.results[0],
  })
}

export function useCreateSubdivisionMutation(surveyId: string) {
  const invalidateSurvey = useSurveyInvalidate(surveyId)
  return useMutation({
    mutationFn: (input: SubdivisionInput) => createSubdivision(input),
    onSuccess: invalidateSurvey,
  })
}

function useSubdivisionInvalidate() {
  const queryClient = useQueryClient()
  // Broad invalidation (no `exact`) also catches the survey-scoped lookup query.
  return () => queryClient.invalidateQueries({ queryKey: ['subdivisions'] })
}

export function useSubmitSubdivisionMutation(id: string) {
  const invalidate = useSubdivisionInvalidate()
  return useMutation({ mutationFn: () => submitSubdivision(id), onSuccess: invalidate })
}

export function useApproveSubdivisionMutation(id: string) {
  const invalidate = useSubdivisionInvalidate()
  return useMutation({ mutationFn: () => approveSubdivision(id), onSuccess: invalidate })
}

export function useRejectSubdivisionMutation(id: string) {
  const invalidate = useSubdivisionInvalidate()
  return useMutation({ mutationFn: () => rejectSubdivision(id), onSuccess: invalidate })
}

// -- Subdivision plots, roads, utilities (all invalidate the parent subdivision) ---------

export function useCreateSubdivisionPlotMutation() {
  const invalidate = useSubdivisionInvalidate()
  return useMutation({
    mutationFn: (input: SubdivisionPlotInput) => createSubdivisionPlot(input),
    onSuccess: invalidate,
  })
}

export function useConvertSubdivisionPlotMutation() {
  const invalidate = useSubdivisionInvalidate()
  return useMutation({
    mutationFn: (subdivisionPlotId: string) => convertSubdivisionPlotToPlot(subdivisionPlotId),
    onSuccess: invalidate,
  })
}

export function useCreateRoadReserveMutation() {
  const invalidate = useSubdivisionInvalidate()
  return useMutation({ mutationFn: (input: RoadReserveInput) => createRoadReserve(input), onSuccess: invalidate })
}

export function useCreateUtilityReserveMutation() {
  const invalidate = useSubdivisionInvalidate()
  return useMutation({
    mutationFn: (input: UtilityReserveInput) => createUtilityReserve(input),
    onSuccess: invalidate,
  })
}
