import { Search } from 'lucide-react'
import { useState } from 'react'

import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/features/auth/hooks/use-auth'

import { DocumentList } from '../components/document-list'
import { UploadDocumentDialog } from '../components/upload-document-dialog'
import { useDocumentsQuery } from '../hooks/use-documents'
import { canAddDocuments } from '../lib/permissions'
import { DOCUMENT_TYPE_LABELS, DOCUMENT_TYPES, type DocumentType } from '../types'

export function DocumentsListPage() {
  const [search, setSearch] = useState('')
  const [documentType, setDocumentType] = useState<DocumentType | 'all'>('all')
  const { user } = useAuth()
  const canAdd = canAddDocuments(user?.permissions)

  const { data, isLoading, isError } = useDocumentsQuery({
    search: search || undefined,
    document_type: documentType === 'all' ? undefined : documentType,
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Documents</h1>
        {canAdd && <UploadDocumentDialog />}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative w-72">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title, description or category"
            className="pl-8"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <Select value={documentType} onValueChange={(value) => setDocumentType(value as DocumentType | 'all')}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {DOCUMENT_TYPES.map((value) => (
              <SelectItem key={value} value={value}>
                {DOCUMENT_TYPE_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl bg-card ring-1 ring-foreground/10">
        {isLoading && <p className="p-4 text-center text-muted-foreground">Loading documents…</p>}
        {isError && <p className="p-4 text-center text-destructive">Failed to load documents.</p>}
        {data && <DocumentList documents={data.results} />}
      </div>
    </div>
  )
}
