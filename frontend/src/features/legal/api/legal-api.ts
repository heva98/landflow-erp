import { apiClient } from '@/lib/api-client'

import type {
  Contract,
  ContractInput,
  DocumentTemplate,
  DocumentTemplateInput,
  OwnershipTransfer,
  OwnershipTransferInput,
  PaginatedResponse,
  PowerOfAttorney,
  PowerOfAttorneyInput,
  SaleAgreement,
  SaleAgreementInput,
  TitleDeed,
  TitleDeedInput,
  Witness,
  WitnessInput,
} from '../types'

// -- Sale agreements ---------------------------------------------------------

export async function fetchSaleAgreements(params: { search?: string; status?: string } = {}) {
  const response = await apiClient.get<PaginatedResponse<SaleAgreement>>('/sale-agreements/', { params })
  return response.data
}

export async function fetchSaleAgreement(id: string) {
  const response = await apiClient.get<SaleAgreement>(`/sale-agreements/${id}/`)
  return response.data
}

export async function createSaleAgreement(input: SaleAgreementInput) {
  const response = await apiClient.post<SaleAgreement>('/sale-agreements/', input)
  return response.data
}

export async function sendAgreementForSignature(id: string) {
  const response = await apiClient.post<SaleAgreement>(`/sale-agreements/${id}/send_for_signature/`)
  return response.data
}

export async function markAgreementSigned(id: string) {
  const response = await apiClient.post<SaleAgreement>(`/sale-agreements/${id}/mark_signed/`)
  return response.data
}

export async function approveAgreement(id: string) {
  const response = await apiClient.post<SaleAgreement>(`/sale-agreements/${id}/approve/`)
  return response.data
}

export async function voidAgreement(id: string, void_reason?: string) {
  const response = await apiClient.post<SaleAgreement>(`/sale-agreements/${id}/void/`, { void_reason })
  return response.data
}

// -- Title deeds --------------------------------------------------------------

export async function fetchTitleDeeds(params: { search?: string; status?: string } = {}) {
  const response = await apiClient.get<PaginatedResponse<TitleDeed>>('/title-deeds/', { params })
  return response.data
}

export async function fetchTitleDeed(id: string) {
  const response = await apiClient.get<TitleDeed>(`/title-deeds/${id}/`)
  return response.data
}

export async function createTitleDeed(input: TitleDeedInput) {
  const response = await apiClient.post<TitleDeed>('/title-deeds/', input)
  return response.data
}

export async function applyTitleDeed(id: string, registry_office?: string) {
  const response = await apiClient.post<TitleDeed>(`/title-deeds/${id}/apply/`, { registry_office })
  return response.data
}

export async function markTitleDeedIssued(id: string, deed_number: string) {
  const response = await apiClient.post<TitleDeed>(`/title-deeds/${id}/mark_issued/`, { deed_number })
  return response.data
}

export async function approveTitleDeed(id: string) {
  const response = await apiClient.post<TitleDeed>(`/title-deeds/${id}/approve/`)
  return response.data
}

// -- Powers of attorney --------------------------------------------------------

export async function fetchPowersOfAttorney(params: { search?: string; status?: string } = {}) {
  const response = await apiClient.get<PaginatedResponse<PowerOfAttorney>>('/powers-of-attorney/', { params })
  return response.data
}

export async function fetchPowerOfAttorney(id: string) {
  const response = await apiClient.get<PowerOfAttorney>(`/powers-of-attorney/${id}/`)
  return response.data
}

export async function createPowerOfAttorney(input: PowerOfAttorneyInput) {
  const response = await apiClient.post<PowerOfAttorney>('/powers-of-attorney/', input)
  return response.data
}

export async function approvePowerOfAttorney(id: string) {
  const response = await apiClient.post<PowerOfAttorney>(`/powers-of-attorney/${id}/approve/`)
  return response.data
}

export async function revokePowerOfAttorney(id: string, revocation_reason?: string) {
  const response = await apiClient.post<PowerOfAttorney>(`/powers-of-attorney/${id}/revoke/`, { revocation_reason })
  return response.data
}

export async function expirePowerOfAttorney(id: string) {
  const response = await apiClient.post<PowerOfAttorney>(`/powers-of-attorney/${id}/expire/`)
  return response.data
}

// -- Contracts ------------------------------------------------------------------

export async function fetchContracts(params: { search?: string; status?: string; contract_type?: string } = {}) {
  const response = await apiClient.get<PaginatedResponse<Contract>>('/legal-contracts/', { params })
  return response.data
}

export async function fetchContract(id: string) {
  const response = await apiClient.get<Contract>(`/legal-contracts/${id}/`)
  return response.data
}

export async function createContract(input: ContractInput) {
  const response = await apiClient.post<Contract>('/legal-contracts/', input)
  return response.data
}

export async function activateContract(id: string) {
  const response = await apiClient.post<Contract>(`/legal-contracts/${id}/activate/`)
  return response.data
}

export async function terminateContract(id: string) {
  const response = await apiClient.post<Contract>(`/legal-contracts/${id}/terminate/`)
  return response.data
}

// -- Ownership transfers ---------------------------------------------------------

export async function fetchOwnershipTransfers(params: { search?: string; status?: string } = {}) {
  const response = await apiClient.get<PaginatedResponse<OwnershipTransfer>>('/ownership-transfers/', { params })
  return response.data
}

export async function fetchOwnershipTransfer(id: string) {
  const response = await apiClient.get<OwnershipTransfer>(`/ownership-transfers/${id}/`)
  return response.data
}

export async function createOwnershipTransfer(input: OwnershipTransferInput) {
  const response = await apiClient.post<OwnershipTransfer>('/ownership-transfers/', input)
  return response.data
}

export async function approveOwnershipTransfer(id: string) {
  const response = await apiClient.post<OwnershipTransfer>(`/ownership-transfers/${id}/approve/`)
  return response.data
}

export async function rejectOwnershipTransfer(id: string, rejection_reason?: string) {
  const response = await apiClient.post<OwnershipTransfer>(`/ownership-transfers/${id}/reject/`, { rejection_reason })
  return response.data
}

export async function completeOwnershipTransfer(id: string) {
  const response = await apiClient.post<OwnershipTransfer>(`/ownership-transfers/${id}/complete/`)
  return response.data
}

// -- Witnesses --------------------------------------------------------------------

export async function fetchWitnesses(contentType: string, objectId: string) {
  const response = await apiClient.get<PaginatedResponse<Witness>>('/legal-witnesses/', {
    params: { content_type: contentType, object_id: objectId },
  })
  return response.data
}

export async function createWitness(input: WitnessInput) {
  const response = await apiClient.post<Witness>('/legal-witnesses/', input)
  return response.data
}

// -- Document templates -----------------------------------------------------------

export async function fetchDocumentTemplates(params: { search?: string; template_type?: string } = {}) {
  const response = await apiClient.get<PaginatedResponse<DocumentTemplate>>('/legal-document-templates/', { params })
  return response.data
}

export async function createDocumentTemplate(input: DocumentTemplateInput) {
  const response = await apiClient.post<DocumentTemplate>('/legal-document-templates/', input)
  return response.data
}
