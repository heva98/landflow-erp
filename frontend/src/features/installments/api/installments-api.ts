import { apiClient } from '@/lib/api-client'

import type {
  Installment,
  InstallmentPayment,
  InstallmentPaymentInput,
  PaginatedResponse,
  PaymentPlan,
  PaymentPlanInput,
  PaymentPlanListParams,
} from '../types'

export async function fetchPaymentPlans(params: PaymentPlanListParams = {}): Promise<PaginatedResponse<PaymentPlan>> {
  const response = await apiClient.get<PaginatedResponse<PaymentPlan>>('/payment-plans/', { params })
  return response.data
}

export async function fetchPaymentPlan(id: string): Promise<PaymentPlan> {
  const response = await apiClient.get<PaymentPlan>(`/payment-plans/${id}/`)
  return response.data
}

export async function createPaymentPlan(input: PaymentPlanInput): Promise<PaymentPlan> {
  const response = await apiClient.post<PaymentPlan>('/payment-plans/', input)
  return response.data
}

export async function fetchInstallment(id: string): Promise<Installment> {
  const response = await apiClient.get<Installment>(`/installments/${id}/`)
  return response.data
}

export async function createInstallmentPayment(input: InstallmentPaymentInput): Promise<InstallmentPayment> {
  const response = await apiClient.post<InstallmentPayment>('/installment-payments/', input)
  return response.data
}
