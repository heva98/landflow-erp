import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createInstallmentPayment, createPaymentPlan, fetchPaymentPlan, fetchPaymentPlans } from '../api/installments-api'
import type { PaymentPlanListParams } from '../types'

export function usePaymentPlansQuery(params: PaymentPlanListParams = {}) {
  return useQuery({
    queryKey: ['payment-plans', params],
    queryFn: () => fetchPaymentPlans(params),
  })
}

export function usePaymentPlanQuery(id: string | undefined) {
  return useQuery({
    queryKey: ['payment-plans', id],
    queryFn: () => fetchPaymentPlan(id as string),
    enabled: Boolean(id),
  })
}

export function useCreatePaymentPlanMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createPaymentPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-plans'] })
    },
  })
}

export function useCreateInstallmentPaymentMutation(paymentPlanId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createInstallmentPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-plans', paymentPlanId] })
      queryClient.invalidateQueries({ queryKey: ['payment-plans'] })
    },
  })
}
