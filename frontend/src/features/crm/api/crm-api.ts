import { apiClient } from '@/lib/api-client'

import type {
  Customer,
  CustomerInput,
  CustomerListParams,
  Lead,
  LeadInput,
  LeadListParams,
  LeadStatus,
  PaginatedResponse,
} from '../types'

export async function fetchLeads(params: LeadListParams = {}): Promise<PaginatedResponse<Lead>> {
  const response = await apiClient.get<PaginatedResponse<Lead>>('/leads/', { params })
  return response.data
}

export async function fetchLead(id: string): Promise<Lead> {
  const response = await apiClient.get<Lead>(`/leads/${id}/`)
  return response.data
}

export async function createLead(input: LeadInput): Promise<Lead> {
  const response = await apiClient.post<Lead>('/leads/', input)
  return response.data
}

export async function updateLead(id: string, input: LeadInput): Promise<Lead> {
  const response = await apiClient.put<Lead>(`/leads/${id}/`, input)
  return response.data
}

export async function updateLeadStatus(id: string, status: LeadStatus): Promise<Lead> {
  const response = await apiClient.patch<Lead>(`/leads/${id}/`, { status })
  return response.data
}

export async function deleteLead(id: string): Promise<void> {
  await apiClient.delete(`/leads/${id}/`)
}

export async function fetchCustomers(params: CustomerListParams = {}): Promise<PaginatedResponse<Customer>> {
  const response = await apiClient.get<PaginatedResponse<Customer>>('/customers/', { params })
  return response.data
}

export async function fetchCustomer(id: string): Promise<Customer> {
  const response = await apiClient.get<Customer>(`/customers/${id}/`)
  return response.data
}

export async function createCustomer(input: CustomerInput): Promise<Customer> {
  const response = await apiClient.post<Customer>('/customers/', input)
  return response.data
}

export async function updateCustomer(id: string, input: CustomerInput): Promise<Customer> {
  const response = await apiClient.put<Customer>(`/customers/${id}/`, input)
  return response.data
}

export async function deleteCustomer(id: string): Promise<void> {
  await apiClient.delete(`/customers/${id}/`)
}
