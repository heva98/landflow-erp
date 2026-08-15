export const DOCUMENT_TYPES = ['pdf', 'word', 'excel', 'image', 'video', 'cad', 'gis', 'other'] as const
export type DocumentType = (typeof DOCUMENT_TYPES)[number]

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  pdf: 'PDF',
  word: 'Word',
  excel: 'Excel',
  image: 'Image',
  video: 'Video',
  cad: 'CAD File',
  gis: 'GIS File',
  other: 'Other',
}

export interface DocumentVersion {
  id: string
  document: string
  version_number: number
  file: string
  file_size: number | null
  mime_type: string
  notes: string
  uploaded_by: string | null
  uploaded_by_name: string | null
  created_at: string
}

export interface Document {
  id: string
  title: string
  description: string
  document_type: DocumentType
  category: string
  // "<app_label>.<model>", e.g. "acquisitions.landacquisition" — null for standalone documents.
  content_type: string | null
  object_id: string
  current_version: DocumentVersion | null
  versions: DocumentVersion[]
  version_count: number
  uploaded_by: string | null
  uploaded_by_name: string | null
  created_at: string
  updated_at: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface DocumentListParams {
  search?: string
  document_type?: DocumentType
  category?: string
  content_type?: string
  object_id?: string
  page?: number
  page_size?: number
}

export interface CreateDocumentInput {
  title: string
  description?: string
  document_type: DocumentType
  category?: string
  content_type?: string
  object_id?: string
  file: File
  version_notes?: string
}

export interface UploadVersionInput {
  file: File
  notes?: string
}
