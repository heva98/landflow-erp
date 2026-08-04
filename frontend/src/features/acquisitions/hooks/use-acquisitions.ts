import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  approveAcquisition,
  cancelAcquisition,
  createAcquisition,
  createAttachment,
  createLandOwner,
  createNegotiation,
  createPurchaseCost,
  fetchAcquisition,
  fetchAcquisitions,
  markAcquisitionPurchased,
  spawnProjectFromAcquisition,
  updateAcquisition,
} from '../api/acquisitions-api'
import type { AcquisitionInput, AcquisitionListParams, CancelAcquisitionInput, MarkPurchasedInput } from '../types'

export function useAcquisitionsQuery(params: AcquisitionListParams = {}) {
  return useQuery({
    queryKey: ['acquisitions', params],
    queryFn: () => fetchAcquisitions(params),
  })
}

export function useAcquisitionQuery(id: string | undefined) {
  return useQuery({
    queryKey: ['acquisitions', id],
    queryFn: () => fetchAcquisition(id as string),
    enabled: Boolean(id),
  })
}

export function useCreateAcquisitionMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createAcquisition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['acquisitions'] })
    },
  })
}

export function useUpdateAcquisitionMutation(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: AcquisitionInput) => updateAcquisition(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['acquisitions'] })
    },
  })
}

function useWorkflowInvalidate(id: string) {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['acquisitions', id] })
    queryClient.invalidateQueries({ queryKey: ['acquisitions'] })
  }
}

export function useApproveAcquisitionMutation(id: string) {
  const invalidate = useWorkflowInvalidate(id)
  return useMutation({
    mutationFn: () => approveAcquisition(id),
    onSuccess: invalidate,
  })
}

export function useMarkAcquisitionPurchasedMutation(id: string) {
  const invalidate = useWorkflowInvalidate(id)
  return useMutation({
    mutationFn: (input: MarkPurchasedInput) => markAcquisitionPurchased(id, input),
    onSuccess: invalidate,
  })
}

export function useCancelAcquisitionMutation(id: string) {
  const invalidate = useWorkflowInvalidate(id)
  return useMutation({
    mutationFn: (input: CancelAcquisitionInput) => cancelAcquisition(id, input),
    onSuccess: invalidate,
  })
}

export function useSpawnProjectMutation(id: string) {
  const invalidate = useWorkflowInvalidate(id)
  return useMutation({
    mutationFn: () => spawnProjectFromAcquisition(id),
    onSuccess: invalidate,
  })
}

export function useCreateLandOwnerMutation(acquisitionId: string) {
  const invalidate = useWorkflowInvalidate(acquisitionId)
  return useMutation({
    mutationFn: createLandOwner,
    onSuccess: invalidate,
  })
}

export function useCreateNegotiationMutation(acquisitionId: string) {
  const invalidate = useWorkflowInvalidate(acquisitionId)
  return useMutation({
    mutationFn: createNegotiation,
    onSuccess: invalidate,
  })
}

export function useCreatePurchaseCostMutation(acquisitionId: string) {
  const invalidate = useWorkflowInvalidate(acquisitionId)
  return useMutation({
    mutationFn: createPurchaseCost,
    onSuccess: invalidate,
  })
}

export function useCreateAttachmentMutation(acquisitionId: string) {
  const invalidate = useWorkflowInvalidate(acquisitionId)
  return useMutation({
    mutationFn: createAttachment,
    onSuccess: invalidate,
  })
}
