export const LEAD_SOURCES = [
  'facebook',
  'instagram',
  'tiktok',
  'website',
  'referral',
  'billboard',
  'walk_in',
] as const
export type LeadSource = (typeof LEAD_SOURCES)[number]

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  website: 'Website',
  referral: 'Referral',
  billboard: 'Billboard',
  walk_in: 'Walk-in',
}

// Pipeline order — also drives the Kanban column order.
export const LEAD_STATUSES = [
  'new',
  'contacted',
  'interested',
  'site_visit',
  'negotiating',
  'reserved',
  'purchased',
  'lost',
] as const
export type LeadStatus = (typeof LEAD_STATUSES)[number]

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  interested: 'Interested',
  site_visit: 'Site Visit',
  negotiating: 'Negotiating',
  reserved: 'Reserved',
  purchased: 'Purchased',
  lost: 'Lost',
}

export interface Lead {
  id: string
  full_name: string
  phone: string
  email: string
  source: LeadSource
  status: LeadStatus
  organization: string | null
  organization_name: string | null
  interested_project: string | null
  interested_project_name: string | null
  referred_by: string | null
  referred_by_name: string | null
  assigned_to: string | null
  assigned_to_name: string | null
  converted_customer: string | null
  created_at: string
  updated_at: string
}

export interface LeadListParams {
  status?: LeadStatus
  source?: LeadSource
  interested_project?: string
  search?: string
  page?: number
  page_size?: number
}

export interface LeadInput {
  full_name: string
  phone: string
  email: string
  source: LeadSource
  status: LeadStatus
  interested_project: string | null
  referred_by: string | null
}

export const CUSTOMER_TYPES = ['individual', 'organization'] as const
export type CustomerType = (typeof CUSTOMER_TYPES)[number]

export const CUSTOMER_TYPE_LABELS: Record<CustomerType, string> = {
  individual: 'Individual',
  organization: 'Organization',
}

export interface Customer {
  id: string
  customer_type: CustomerType
  full_name: string
  organization: string | null
  organization_name: string | null
  phone: string
  email: string
  address: string
  created_at: string
  updated_at: string
}

export interface CustomerListParams {
  customer_type?: CustomerType
  search?: string
  page?: number
}

export interface CustomerInput {
  customer_type: CustomerType
  full_name: string
  phone: string
  email: string
  address: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
