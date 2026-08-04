import { apiClient } from '@/lib/api-client'

import type {
  AcquisitionAttachment,
  AcquisitionInput,
  AcquisitionListParams,
  AttachmentInput,
  CancelAcquisitionInput,
  LandAcquisition,
  LandOwner,
  LandOwnerInput,
  MarkPurchasedInput,
  Negotiation,
  NegotiationInput,
  PaginatedResponse,
  PurchaseCost,
  PurchaseCostInput,
} from '../types'

export async function fetchAcquisitions(params: AcquisitionListParams = {}): Promise<PaginatedResponse<LandAcquisition>> {
  const response = await apiClient.get<PaginatedResponse<LandAcquisition>>('/land-acquisitions/', { params })
  return response.data
}

export async function fetchAcquisition(id: string): Promise<LandAcquisition> {
  const response = await apiClient.get<LandAcquisition>(`/land-acquisitions/${id}/`)
  return response.data
}

export async function createAcquisition(input: AcquisitionInput): Promise<LandAcquisition> {
  const response = await apiClient.post<LandAcquisition>('/land-acquisitions/', input)
  return response.data
}

export async function updateAcquisition(id: string, input: AcquisitionInput): Promise<LandAcquisition> {
  const response = await apiClient.put<LandAcquisition>(`/land-acquisitions/${id}/`, input)
  return response.data
}

export async function approveAcquisition(id: string): Promise<LandAcquisition> {
  const response = await apiClient.post<LandAcquisition>(`/land-acquisitions/${id}/approve/`)
  return response.data
}

export async function markAcquisitionPurchased(id: string, input: MarkPurchasedInput): Promise<LandAcquisition> {
  const response = await apiClient.post<LandAcquisition>(`/land-acquisitions/${id}/mark_purchased/`, input)
  return response.data
}

export async function cancelAcquisition(id: string, input: CancelAcquisitionInput): Promise<LandAcquisition> {
  const response = await apiClient.post<LandAcquisition>(`/land-acquisitions/${id}/cancel/`, input)
  return response.data
}

export async function spawnProjectFromAcquisition(id: string): Promise<LandAcquisition> {
  const response = await apiClient.post<LandAcquisition>(`/land-acquisitions/${id}/spawn_project/`)
  return response.data
}

export async function createLandOwner(input: LandOwnerInput): Promise<LandOwner> {
  const response = await apiClient.post<LandOwner>('/land-owners/', input)
  return response.data
}

export async function createNegotiation(input: NegotiationInput): Promise<Negotiation> {
  const response = await apiClient.post<Negotiation>('/acquisition-negotiations/', input)
  return response.data
}

export async function createPurchaseCost(input: PurchaseCostInput): Promise<PurchaseCost> {
  const response = await apiClient.post<PurchaseCost>('/acquisition-purchase-costs/', input)
  return response.data
}

export async function createAttachment(input: AttachmentInput): Promise<AcquisitionAttachment> {
  const formData = new FormData()
  formData.append('acquisition', input.acquisition)
  formData.append('document_type', input.document_type)
  formData.append('description', input.description ?? '')
  formData.append('file', input.file)
  const response = await apiClient.post<AcquisitionAttachment>('/acquisition-attachments/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}
