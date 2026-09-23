import { Badge } from '@/components/ui/badge'

import { DOCUMENT_TYPE_LABELS, type DocumentType } from '../types'

const typeVariant: Record<DocumentType, 'default' | 'secondary' | 'info' | 'success' | 'warning' | 'outline'> = {
  pdf: 'default',
  word: 'info',
  excel: 'success',
  image: 'secondary',
  video: 'secondary',
  cad: 'warning',
  gis: 'warning',
  other: 'outline',
}

export function DocumentTypeBadge({ type }: { type: DocumentType }) {
  return <Badge variant={typeVariant[type]}>{DOCUMENT_TYPE_LABELS[type]}</Badge>
}
