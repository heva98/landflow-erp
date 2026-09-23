export const SALE_AGREEMENT_STATUSES = ['draft', 'sent_for_signature', 'signed', 'approved', 'void'] as const
export type SaleAgreementStatus = (typeof SALE_AGREEMENT_STATUSES)[number]
export const SALE_AGREEMENT_STATUS_LABELS: Record<SaleAgreementStatus, string> = {
  draft: 'Draft',
  sent_for_signature: 'Sent for Signature',
  signed: 'Signed',
  approved: 'Approved',
  void: 'Void',
}

export const TITLE_DEED_STATUSES = ['pending', 'applied', 'issued', 'approved'] as const
export type TitleDeedStatus = (typeof TITLE_DEED_STATUSES)[number]
export const TITLE_DEED_STATUS_LABELS: Record<TitleDeedStatus, string> = {
  pending: 'Pending',
  applied: 'Applied at Registry',
  issued: 'Issued',
  approved: 'Approved',
}

export const POA_STATUSES = ['pending', 'active', 'expired', 'revoked'] as const
export type PoaStatus = (typeof POA_STATUSES)[number]
export const POA_STATUS_LABELS: Record<PoaStatus, string> = {
  pending: 'Pending',
  active: 'Active',
  expired: 'Expired',
  revoked: 'Revoked',
}

export const CONTRACT_TYPES = ['service', 'vendor', 'employment', 'partnership', 'other'] as const
export type ContractType = (typeof CONTRACT_TYPES)[number]
export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  service: 'Service Agreement',
  vendor: 'Vendor Agreement',
  employment: 'Employment Contract',
  partnership: 'Partnership Agreement',
  other: 'Other',
}

export const CONTRACT_STATUSES = ['draft', 'active', 'expired', 'terminated'] as const
export type ContractStatus = (typeof CONTRACT_STATUSES)[number]
export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  expired: 'Expired',
  terminated: 'Terminated',
}

export const TRANSFER_STATUSES = ['pending', 'approved', 'completed', 'rejected'] as const
export type TransferStatus = (typeof TRANSFER_STATUSES)[number]
export const TRANSFER_STATUS_LABELS: Record<TransferStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  completed: 'Completed',
  rejected: 'Rejected',
}

export const TEMPLATE_TYPES = ['sale_agreement', 'title_deed', 'power_of_attorney', 'contract', 'other'] as const
export type TemplateType = (typeof TEMPLATE_TYPES)[number]
export const TEMPLATE_TYPE_LABELS: Record<TemplateType, string> = {
  sale_agreement: 'Sale Agreement',
  title_deed: 'Title Deed',
  power_of_attorney: 'Power of Attorney',
  contract: 'Contract',
  other: 'Other',
}

export interface Witness {
  id: string
  content_type: string
  object_id: string
  full_name: string
  national_id: string
  phone: string
  signed_at: string | null
  created_at: string
  updated_at: string
}

export interface SaleAgreement {
  id: string
  sale: string
  sale_number: string
  agreement_number: string
  status: SaleAgreementStatus
  terms: string
  signed_date: string | null
  prepared_by: string | null
  prepared_by_name: string | null
  approved_by: string | null
  approved_by_name: string | null
  approved_at: string | null
  voided_at: string | null
  void_reason: string
  witnesses: Witness[]
  created_at: string
  updated_at: string
}

export interface TitleDeed {
  id: string
  sale: string
  sale_number: string
  deed_number: string
  status: TitleDeedStatus
  registry_office: string
  applied_date: string | null
  issued_date: string | null
  notes: string
  approved_by: string | null
  approved_by_name: string | null
  approved_at: string | null
  created_at: string
  updated_at: string
}

export interface PowerOfAttorney {
  id: string
  poa_number: string
  sale: string | null
  sale_number: string | null
  grantor_name: string
  grantee_name: string
  status: PoaStatus
  granted_date: string | null
  expiry_date: string | null
  notes: string
  approved_by: string | null
  approved_by_name: string | null
  approved_at: string | null
  revoked_at: string | null
  revocation_reason: string
  witnesses: Witness[]
  created_at: string
  updated_at: string
}

export interface Contract {
  id: string
  contract_number: string
  title: string
  contract_type: ContractType
  counterparty_name: string
  status: ContractStatus
  start_date: string | null
  end_date: string | null
  notes: string
  content_type: string | null
  object_id: string
  created_by: string | null
  created_by_name: string | null
  witnesses: Witness[]
  created_at: string
  updated_at: string
}

export interface OwnershipTransfer {
  id: string
  sale: string
  sale_number: string
  plot_number: string
  customer_name: string
  transfer_number: string
  status: TransferStatus
  requested_by: string | null
  requested_by_name: string | null
  approved_by: string | null
  approved_by_name: string | null
  approved_at: string | null
  completed_at: string | null
  rejection_reason: string
  notes: string
  witnesses: Witness[]
  created_at: string
  updated_at: string
}

export interface DocumentTemplate {
  id: string
  name: string
  template_type: TemplateType
  description: string
  is_active: boolean
  created_by: string | null
  created_by_name: string | null
  created_at: string
  updated_at: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface SaleAgreementInput {
  sale: string
  terms?: string
}

export interface TitleDeedInput {
  sale: string
  notes?: string
}

export interface PowerOfAttorneyInput {
  sale?: string
  grantor_name: string
  grantee_name: string
  granted_date?: string | null
  expiry_date?: string | null
  notes?: string
}

export interface ContractInput {
  title: string
  contract_type: ContractType
  counterparty_name: string
  start_date?: string | null
  end_date?: string | null
  notes?: string
}

export interface OwnershipTransferInput {
  sale: string
  notes?: string
}

export interface DocumentTemplateInput {
  name: string
  template_type: TemplateType
  description?: string
  is_active?: boolean
}

export interface WitnessInput {
  content_type: string
  object_id: string
  full_name: string
  national_id?: string
  phone?: string
  signed_at?: string | null
}
