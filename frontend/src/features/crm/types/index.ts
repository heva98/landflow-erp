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
  lost_reason: string
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
  lost_reason: string
  interested_project: string | null
  referred_by: string | null
  assigned_to: string | null
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

// --- Notes & communication log — both attach to a Lead, Customer or Organization. ---

export type CRMTargetType = 'lead' | 'customer' | 'organization'

export interface CRMTargetRef {
  lead?: string
  customer?: string
  organization?: string
}

export interface CRMTargetFilterParams {
  target_type?: CRMTargetType
  object_id?: string
}

export interface Note {
  id: string
  target_type: CRMTargetType
  target_id: string
  author: string | null
  author_name: string | null
  body: string
  created_at: string
  updated_at: string
}

export interface NoteInput extends CRMTargetRef {
  body: string
}

export type NoteListParams = CRMTargetFilterParams

export const COMMUNICATION_CHANNELS = ['call', 'whatsapp', 'sms', 'email'] as const
export type CommunicationChannel = (typeof COMMUNICATION_CHANNELS)[number]

export const COMMUNICATION_CHANNEL_LABELS: Record<CommunicationChannel, string> = {
  call: 'Call',
  whatsapp: 'WhatsApp',
  sms: 'SMS',
  email: 'Email',
}

export const COMMUNICATION_DIRECTIONS = ['inbound', 'outbound'] as const
export type CommunicationDirection = (typeof COMMUNICATION_DIRECTIONS)[number]

export const COMMUNICATION_DIRECTION_LABELS: Record<CommunicationDirection, string> = {
  inbound: 'Inbound',
  outbound: 'Outbound',
}

export interface CommunicationLogEntry {
  id: string
  target_type: CRMTargetType
  target_id: string
  channel: CommunicationChannel
  direction: CommunicationDirection
  subject: string
  body: string
  occurred_at: string
  logged_by: string | null
  logged_by_name: string | null
  created_at: string
  updated_at: string
}

export interface CommunicationLogInput extends CRMTargetRef {
  channel: CommunicationChannel
  direction: CommunicationDirection
  subject: string
  body: string
}

export type CommunicationLogListParams = CRMTargetFilterParams
