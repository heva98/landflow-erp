import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  activateContract,
  applyTitleDeed,
  approveAgreement,
  approveOwnershipTransfer,
  approvePowerOfAttorney,
  approveTitleDeed,
  completeOwnershipTransfer,
  createContract,
  createDocumentTemplate,
  createOwnershipTransfer,
  createPowerOfAttorney,
  createSaleAgreement,
  createTitleDeed,
  createWitness,
  expirePowerOfAttorney,
  fetchContract,
  fetchContracts,
  fetchDocumentTemplates,
  fetchOwnershipTransfer,
  fetchOwnershipTransfers,
  fetchPowerOfAttorney,
  fetchPowersOfAttorney,
  fetchSaleAgreement,
  fetchSaleAgreements,
  fetchTitleDeed,
  fetchTitleDeeds,
  fetchWitnesses,
  markAgreementSigned,
  markTitleDeedIssued,
  rejectOwnershipTransfer,
  revokePowerOfAttorney,
  sendAgreementForSignature,
  terminateContract,
  voidAgreement,
} from '../api/legal-api'
import type {
  ContractInput,
  DocumentTemplateInput,
  OwnershipTransferInput,
  PowerOfAttorneyInput,
  SaleAgreementInput,
  WitnessInput,
} from '../types'

// -- Sale agreements ---------------------------------------------------------

export function useSaleAgreementsQuery(params: { search?: string; status?: string } = {}) {
  return useQuery({ queryKey: ['sale-agreements', params], queryFn: () => fetchSaleAgreements(params) })
}

export function useSaleAgreementQuery(id: string | undefined) {
  return useQuery({
    queryKey: ['sale-agreements', id],
    queryFn: () => fetchSaleAgreement(id as string),
    enabled: Boolean(id),
  })
}

export function useCreateSaleAgreementMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: SaleAgreementInput) => createSaleAgreement(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sale-agreements'] }),
  })
}

function useAgreementInvalidate(id: string) {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['sale-agreements', id] })
    queryClient.invalidateQueries({ queryKey: ['sale-agreements'] })
  }
}

export function useSendAgreementForSignatureMutation(id: string) {
  const invalidate = useAgreementInvalidate(id)
  return useMutation({ mutationFn: () => sendAgreementForSignature(id), onSuccess: invalidate })
}

export function useMarkAgreementSignedMutation(id: string) {
  const invalidate = useAgreementInvalidate(id)
  return useMutation({ mutationFn: () => markAgreementSigned(id), onSuccess: invalidate })
}

export function useApproveAgreementMutation(id: string) {
  const invalidate = useAgreementInvalidate(id)
  return useMutation({ mutationFn: () => approveAgreement(id), onSuccess: invalidate })
}

export function useVoidAgreementMutation(id: string) {
  const invalidate = useAgreementInvalidate(id)
  return useMutation({ mutationFn: (void_reason?: string) => voidAgreement(id, void_reason), onSuccess: invalidate })
}

// -- Title deeds --------------------------------------------------------------

export function useTitleDeedsQuery(params: { search?: string; status?: string } = {}) {
  return useQuery({ queryKey: ['title-deeds', params], queryFn: () => fetchTitleDeeds(params) })
}

export function useTitleDeedQuery(id: string | undefined) {
  return useQuery({
    queryKey: ['title-deeds', id],
    queryFn: () => fetchTitleDeed(id as string),
    enabled: Boolean(id),
  })
}

export function useCreateTitleDeedMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { sale: string; notes?: string }) => createTitleDeed(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['title-deeds'] }),
  })
}

function useTitleDeedInvalidate(id: string) {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['title-deeds', id] })
    queryClient.invalidateQueries({ queryKey: ['title-deeds'] })
  }
}

export function useApplyTitleDeedMutation(id: string) {
  const invalidate = useTitleDeedInvalidate(id)
  return useMutation({
    mutationFn: (registry_office?: string) => applyTitleDeed(id, registry_office),
    onSuccess: invalidate,
  })
}

export function useMarkTitleDeedIssuedMutation(id: string) {
  const invalidate = useTitleDeedInvalidate(id)
  return useMutation({
    mutationFn: (deed_number: string) => markTitleDeedIssued(id, deed_number),
    onSuccess: invalidate,
  })
}

export function useApproveTitleDeedMutation(id: string) {
  const invalidate = useTitleDeedInvalidate(id)
  return useMutation({ mutationFn: () => approveTitleDeed(id), onSuccess: invalidate })
}

// -- Powers of attorney --------------------------------------------------------

export function usePowersOfAttorneyQuery(params: { search?: string; status?: string } = {}) {
  return useQuery({ queryKey: ['powers-of-attorney', params], queryFn: () => fetchPowersOfAttorney(params) })
}

export function usePowerOfAttorneyQuery(id: string | undefined) {
  return useQuery({
    queryKey: ['powers-of-attorney', id],
    queryFn: () => fetchPowerOfAttorney(id as string),
    enabled: Boolean(id),
  })
}

export function useCreatePowerOfAttorneyMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: PowerOfAttorneyInput) => createPowerOfAttorney(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['powers-of-attorney'] }),
  })
}

function usePoaInvalidate(id: string) {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['powers-of-attorney', id] })
    queryClient.invalidateQueries({ queryKey: ['powers-of-attorney'] })
  }
}

export function useApprovePoaMutation(id: string) {
  const invalidate = usePoaInvalidate(id)
  return useMutation({ mutationFn: () => approvePowerOfAttorney(id), onSuccess: invalidate })
}

export function useRevokePoaMutation(id: string) {
  const invalidate = usePoaInvalidate(id)
  return useMutation({
    mutationFn: (revocation_reason?: string) => revokePowerOfAttorney(id, revocation_reason),
    onSuccess: invalidate,
  })
}

export function useExpirePoaMutation(id: string) {
  const invalidate = usePoaInvalidate(id)
  return useMutation({ mutationFn: () => expirePowerOfAttorney(id), onSuccess: invalidate })
}

// -- Contracts ------------------------------------------------------------------

export function useContractsQuery(params: { search?: string; status?: string; contract_type?: string } = {}) {
  return useQuery({ queryKey: ['legal-contracts', params], queryFn: () => fetchContracts(params) })
}

export function useContractQuery(id: string | undefined) {
  return useQuery({
    queryKey: ['legal-contracts', id],
    queryFn: () => fetchContract(id as string),
    enabled: Boolean(id),
  })
}

export function useCreateContractMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ContractInput) => createContract(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['legal-contracts'] }),
  })
}

function useContractInvalidate(id: string) {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['legal-contracts', id] })
    queryClient.invalidateQueries({ queryKey: ['legal-contracts'] })
  }
}

export function useActivateContractMutation(id: string) {
  const invalidate = useContractInvalidate(id)
  return useMutation({ mutationFn: () => activateContract(id), onSuccess: invalidate })
}

export function useTerminateContractMutation(id: string) {
  const invalidate = useContractInvalidate(id)
  return useMutation({ mutationFn: () => terminateContract(id), onSuccess: invalidate })
}

// -- Ownership transfers ---------------------------------------------------------

export function useOwnershipTransfersQuery(params: { search?: string; status?: string } = {}) {
  return useQuery({ queryKey: ['ownership-transfers', params], queryFn: () => fetchOwnershipTransfers(params) })
}

export function useOwnershipTransferQuery(id: string | undefined) {
  return useQuery({
    queryKey: ['ownership-transfers', id],
    queryFn: () => fetchOwnershipTransfer(id as string),
    enabled: Boolean(id),
  })
}

export function useCreateOwnershipTransferMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: OwnershipTransferInput) => createOwnershipTransfer(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ownership-transfers'] }),
  })
}

function useTransferInvalidate(id: string) {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['ownership-transfers', id] })
    queryClient.invalidateQueries({ queryKey: ['ownership-transfers'] })
  }
}

export function useApproveTransferMutation(id: string) {
  const invalidate = useTransferInvalidate(id)
  return useMutation({ mutationFn: () => approveOwnershipTransfer(id), onSuccess: invalidate })
}

export function useRejectTransferMutation(id: string) {
  const invalidate = useTransferInvalidate(id)
  return useMutation({
    mutationFn: (rejection_reason?: string) => rejectOwnershipTransfer(id, rejection_reason),
    onSuccess: invalidate,
  })
}

export function useCompleteTransferMutation(id: string) {
  const invalidate = useTransferInvalidate(id)
  return useMutation({ mutationFn: () => completeOwnershipTransfer(id), onSuccess: invalidate })
}

// -- Witnesses --------------------------------------------------------------------

export function useWitnessesQuery(contentType: string, objectId: string) {
  return useQuery({
    queryKey: ['legal-witnesses', contentType, objectId],
    queryFn: () => fetchWitnesses(contentType, objectId),
    enabled: Boolean(contentType && objectId),
  })
}

export function useCreateWitnessMutation(invalidateKey: unknown[]) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: WitnessInput) => createWitness(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: invalidateKey }),
  })
}

// -- Document templates -----------------------------------------------------------

export function useDocumentTemplatesQuery(params: { search?: string; template_type?: string } = {}) {
  return useQuery({ queryKey: ['legal-document-templates', params], queryFn: () => fetchDocumentTemplates(params) })
}

export function useCreateDocumentTemplateMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: DocumentTemplateInput) => createDocumentTemplate(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['legal-document-templates'] }),
  })
}
