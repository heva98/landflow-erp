import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/features/auth/hooks/use-auth'

import { useDocumentsQuery } from '../hooks/use-documents'
import { canAddDocuments } from '../lib/permissions'
import { DocumentList } from './document-list'
import { UploadDocumentDialog } from './upload-document-dialog'

/**
 * Drop this into any other module's detail page to attach and list documents
 * for that record — e.g. <DocumentsPanel contentType="acquisitions.landacquisition" objectId={acquisition.id} />.
 */
export function DocumentsPanel({
  contentType,
  objectId,
  title = 'Documents',
}: {
  contentType: string
  objectId: string
  title?: string
}) {
  const { user } = useAuth()
  const canAdd = canAddDocuments(user?.permissions)
  const { data, isLoading, isError } = useDocumentsQuery({ content_type: contentType, object_id: objectId })

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        {canAdd && <UploadDocumentDialog contentType={contentType} objectId={objectId} />}
      </CardHeader>
      <CardContent>
        {isLoading && <p className="text-sm text-muted-foreground">Loading documents…</p>}
        {isError && <p className="text-sm text-destructive">Failed to load documents.</p>}
        {data && <DocumentList documents={data.results} />}
      </CardContent>
    </Card>
  )
}
