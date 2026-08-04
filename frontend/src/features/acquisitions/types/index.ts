export const ACQUISITION_STATUSES = ['potential', 'negotiating', 'approved', 'purchased', 'cancelled'] as const
export type AcquisitionStatus = (typeof ACQUISITION_STATUSES)[number]

export const ACQUISITION_STATUS_LABELS: Record<AcquisitionStatus, string> = {
  potential: 'Potential',
  negotiating: 'Negotiating',
  approved: 'Approved',
  purchased: 'Purchased',
  cancelled: 'Cancelled',
}

export const COST_TYPES = [
  'legal_fees', 'survey_fees', 'agent_commission', 'stamp_duty', 'transfer_fees', 'other',
] as const
export type CostType = (typeof COST_TYPES)[number]

export const COST_TYPE_LABELS: Record<CostType, string> = {
  legal_fees: 'Legal Fees',
  survey_fees: 'Survey Fees',
  agent_commission: 'Agent Commission',
  stamp_duty: 'Stamp Duty',
  transfer_fees: 'Transfer Fees',
  other: 'Other',
}

export const DOCUMENT_TYPES = [
  'title_deed', 'survey_map', 'id_copy', 'agreement', 'valuation_report', 'other',
] as const
export type DocumentType = (typeof DOCUMENT_TYPES)[number]

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  title_deed: 'Title Deed',
  survey_map: 'Survey Map',
  id_copy: 'ID Copy',
  agreement: 'Agreement',
  valuation_report: 'Valuation Report',
  other: 'Other',
}

export interface LandOwner {
  id: string
  acquisition: string
  full_name: string
  national_id: string
  phone: string
  email: string
  address: string
  ownership_percentage: string
  created_at: string
  updated_at: string
}

export interface Negotiation {
  id: string
  acquisition: string
  negotiated_on: string
  offered_price: string | null
  counter_offer_price: string | null
  notes: string
  negotiated_by: string | null
  negotiated_by_name: string | null
  created_at: string
  updated_at: string
}

export interface PurchaseCost {
  id: string
  acquisition: string
  cost_type: CostType
  description: string
  amount: string
  incurred_on: string
  created_at: string
  updated_at: string
}

export interface AcquisitionAttachment {
  id: string
  acquisition: string
  document_type: DocumentType
  file: string
  description: string
  uploaded_by: string | null
  uploaded_by_name: string | null
  created_at: string
  updated_at: string
}

export interface LandAcquisition {
  id: string
  reference_number: string
  name: string
  status: AcquisitionStatus
  description: string
  location: string
  region: string
  district: string
  latitude: string | null
  longitude: string | null
  area_sqm: string
  ownership_verified: boolean
  legal_checks_passed: boolean
  due_diligence_notes: string
  valuation_amount: string
  valuation_date: string | null
  valuator_name: string
  asking_price: string
  purchase_price: string
  total_purchase_cost: string
  purchased_at: string | null
  approved_by: string | null
  approved_by_name: string | null
  approved_at: string | null
  cancelled_at: string | null
  cancellation_reason: string
  project: string | null
  project_name: string | null
  notes: string
  created_by: string | null
  created_by_name: string | null
  owners: LandOwner[]
  negotiations: Negotiation[]
  purchase_costs: PurchaseCost[]
  attachments: AcquisitionAttachment[]
  created_at: string
  updated_at: string
}

export interface AcquisitionListParams {
  status?: AcquisitionStatus
  search?: string
  page?: number
  page_size?: number
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface AcquisitionInput {
  name: string
  description: string
  location: string
  region: string
  district: string
  latitude: number | null
  longitude: number | null
  area_sqm: number
  ownership_verified: boolean
  legal_checks_passed: boolean
  due_diligence_notes: string
  valuation_amount: number
  valuation_date: string | null
  valuator_name: string
  asking_price: number
  purchase_price: number
  notes: string
}

export interface LandOwnerInput {
  acquisition: string
  full_name: string
  national_id?: string
  phone?: string
  email?: string
  address?: string
  ownership_percentage: number
}

export interface NegotiationInput {
  acquisition: string
  negotiated_on: string
  offered_price?: number | null
  counter_offer_price?: number | null
  notes?: string
}

export interface PurchaseCostInput {
  acquisition: string
  cost_type: CostType
  description?: string
  amount: number
  incurred_on: string
}

export interface AttachmentInput {
  acquisition: string
  document_type: DocumentType
  description?: string
  file: File
}

export interface MarkPurchasedInput {
  purchase_price: number
  purchased_at?: string
}

export interface CancelAcquisitionInput {
  cancellation_reason?: string
}
