import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createCustomer, deleteCustomer, fetchCustomer, fetchCustomers, updateCustomer } from '../api/crm-api'
import type { CustomerInput, CustomerListParams } from '../types'

export function useCustomersQuery(params: CustomerListParams = {}) {
  return useQuery({
    queryKey: ['customers', params],
    queryFn: () => fetchCustomers(params),
  })
}

export function useCustomerQuery(id: string | undefined) {
  return useQuery({
    queryKey: ['customers', id],
    queryFn: () => fetchCustomer(id as string),
    enabled: Boolean(id),
  })
}

export function useCreateCustomerMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}

export function useUpdateCustomerMutation(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CustomerInput) => updateCustomer(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}

export function useDeleteCustomerMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}
