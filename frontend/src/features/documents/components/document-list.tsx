import { Download } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import { formatFileSize, resolveFileUrl } from '../lib/format'
import type { Document } from '../types'
import { DocumentTypeBadge } from './document-type-badge'

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-GB')
}

export function DocumentList({ documents, emptyLabel = 'No documents yet.' }: { documents: Document[]; emptyLabel?: string }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Version</TableHead>
          <TableHead>Size</TableHead>
          <TableHead>Uploaded by</TableHead>
          <TableHead>Updated</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {documents.length === 0 && (
          <TableRow>
            <TableCell colSpan={8} className="text-center text-muted-foreground">
              {emptyLabel}
            </TableCell>
          </TableRow>
        )}
        {documents.map((document) => (
          <TableRow key={document.id}>
            <TableCell className="font-medium text-foreground">
              <Link to={`/documents/${document.id}`} className="hover:underline">
                {document.title}
              </Link>
            </TableCell>
            <TableCell>
              <DocumentTypeBadge type={document.document_type} />
            </TableCell>
            <TableCell>{document.category || '—'}</TableCell>
            <TableCell>v{document.current_version?.version_number ?? '—'}</TableCell>
            <TableCell>{formatFileSize(document.current_version?.file_size ?? null)}</TableCell>
            <TableCell>{document.uploaded_by_name ?? '—'}</TableCell>
            <TableCell>{formatDate(document.updated_at)}</TableCell>
            <TableCell>
              {document.current_version && (
                <a
                  href={resolveFileUrl(document.current_version.file)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary underline underline-offset-4"
                >
                  <Download className="size-3.5" /> Download
                </a>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
