import { ArrowLeft, Download } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/features/auth/hooks/use-auth'

import { DocumentTypeBadge } from '../components/document-type-badge'
import { UploadVersionDialog } from '../components/upload-version-dialog'
import { useDocumentQuery } from '../hooks/use-documents'
import { canAddDocuments } from '../lib/permissions'
import { formatFileSize, resolveFileUrl } from '../lib/format'

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('en-GB')
}

export function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const canAdd = canAddDocuments(user?.permissions)
  const { data: document, isLoading, isError } = useDocumentQuery(id)

  if (isLoading) {
    return <p className="text-muted-foreground">Loading document…</p>
  }

  if (isError || !document) {
    return <p className="text-destructive">Document not found.</p>
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/documents')} aria-label="Back to documents">
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{document.title}</h1>
            <p className="text-sm text-muted-foreground">
              {document.category || 'Uncategorized'} · Uploaded by {document.uploaded_by_name ?? 'Unknown'}
            </p>
          </div>
          <DocumentTypeBadge type={document.document_type} />
        </div>
        {canAdd && <UploadVersionDialog documentId={document.id} />}
      </div>

      {document.current_version && (
        <Card>
          <CardContent className="flex items-center justify-between py-4 text-sm">
            <span>
              Current version: v{document.current_version.version_number} ({formatFileSize(document.current_version.file_size)})
            </span>
            <a
              href={resolveFileUrl(document.current_version.file)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-primary underline underline-offset-4"
            >
              <Download className="size-3.5" /> Download latest
            </a>
          </CardContent>
        </Card>
      )}

      {document.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-foreground">{document.description}</CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Version history</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Version</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Uploaded by</TableHead>
                <TableHead>Uploaded at</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {document.versions.map((version) => (
                <TableRow key={version.id}>
                  <TableCell className="font-medium text-foreground">v{version.version_number}</TableCell>
                  <TableCell>{formatFileSize(version.file_size)}</TableCell>
                  <TableCell>{version.notes || '—'}</TableCell>
                  <TableCell>{version.uploaded_by_name ?? '—'}</TableCell>
                  <TableCell>{formatDateTime(version.created_at)}</TableCell>
                  <TableCell>
                    <a
                      href={resolveFileUrl(version.file)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-primary underline underline-offset-4"
                    >
                      View
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
