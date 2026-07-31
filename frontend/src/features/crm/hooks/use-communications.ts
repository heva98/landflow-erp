import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createCommunication, fetchCommunications } from '../api/crm-api'
import type { CommunicationLogInput, CommunicationLogListParams } from '../types'

export function useCommunicationsQuery(params: CommunicationLogListParams) {
  return useQuery({
    queryKey: ['communications', params],
    queryFn: () => fetchCommunications(params),
    enabled: Boolean(params.object_id),
  })
}

export function useCreateCommunicationMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CommunicationLogInput) => createCommunication(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communications'] })
    },
  })
}
