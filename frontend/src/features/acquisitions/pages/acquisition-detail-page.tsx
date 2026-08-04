import { ArrowLeft, Pencil } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { formatTZS } from '@/lib/utils'

import { AcquisitionStatusBadge } from '../components/acquisition-status-badge'
import { AcquisitionWorkflowActions } from '../components/acquisition-workflow-actions'
import { AddAttachmentDialog } from '../components/add-attachment-dialog'
import { AddNegotiationDialog } from '../components/add-negotiation-dialog'
import { AddOwnerDialog } from '../components/add-owner-dialog'
import { AddPurchaseCostDialog } from '../components/add-purchase-cost-dialog'
import { useAcquisitionQuery } from '../hooks/use-acquisitions'
import { canEditAcquisitions, canManageAcquisitionWorkflow } from '../lib/permissions'
import { COST_TYPE_LABELS, DOCUMENT_TYPE_LABELS } from '../types'

const apiBaseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1'
const mediaOrigin = apiBaseURL.replace(/\/api\/v1\/?$/, '')

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString('en-GB') : '—'
}

export function AcquisitionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const canEdit = canEditAcquisitions(user?.permissions)
  const canManageWorkflow = canManageAcquisitionWorkflow(user?.permissions)
  const { data: acquisition, isLoading, isError } = useAcquisitionQuery(id)

  if (isLoading) {
    return <p className="text-muted-foreground">Loading acquisition…</p>
  }

  if (isError || !acquisition) {
    return <p className="text-destructive">Land acquisition not found.</p>
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/acquisitions')} aria-label="Back to acquisitions">
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{acquisition.name}</h1>
            <p className="text-sm text-muted-foreground">
              {acquisition.reference_number} · {acquisition.location}
            </p>
          </div>
          <AcquisitionStatusBadge status={acquisition.status} />
        </div>
        <div className="flex items-center gap-2">
          {canEdit && acquisition.status !== 'cancelled' && (
            <Button asChild variant="outline">
              <Link to={`/acquisitions/${acquisition.id}/edit`}>
                <Pencil /> Edit
              </Link>
            </Button>
          )}
          {canManageWorkflow && <AcquisitionWorkflowActions acquisition={acquisition} />}
        </div>
      </div>

      {acquisition.project && (
        <Card>
          <CardContent className="flex items-center justify-between py-4 text-sm">
            <span>
              This acquisition has spawned{' '}
              <Link to={`/projects/${acquisition.project}`} className="font-medium text-primary underline underline-offset-4">
                {acquisition.project_name}
              </Link>
            </span>
          </CardContent>
        </Card>
      )}

      {acquisition.status === 'cancelled' && acquisition.cancellation_reason && (
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Cancellation reason</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-foreground">{acquisition.cancellation_reason}</CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Area</CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-semibold text-foreground">
            {Number(acquisition.area_sqm).toLocaleString()} sqm
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Asking price</CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-semibold text-foreground">
            {formatTZS(acquisition.asking_price)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Purchase price</CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-semibold text-foreground">
            {formatTZS(acquisition.purchase_price)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total purchase cost</CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-semibold text-foreground">
            {formatTZS(acquisition.total_purchase_cost)}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Location &amp; due diligence</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">Region</p>
            <p className="font-medium text-foreground">{acquisition.region || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">District</p>
            <p className="font-medium text-foreground">{acquisition.district || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">GPS coordinates</p>
            <p className="font-medium text-foreground">
              {acquisition.latitude && acquisition.longitude
                ? `${acquisition.latitude}, ${acquisition.longitude}`
                : '—'}
            </p>
          </div>
          <div />
          <div>
            <p className="text-xs text-muted-foreground">Ownership verified</p>
            <p className="font-medium text-foreground">{acquisition.ownership_verified ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Legal checks passed</p>
            <p className="font-medium text-foreground">{acquisition.legal_checks_passed ? 'Yes' : 'No'}</p>
          </div>
          {acquisition.due_diligence_notes && (
            <div className="col-span-2 sm:col-span-4">
              <p className="text-xs text-muted-foreground">Due diligence notes</p>
              <p className="font-medium text-foreground">{acquisition.due_diligence_notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Valuation</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">Valuation amount</p>
            <p className="font-medium text-foreground">{formatTZS(acquisition.valuation_amount)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Valuation date</p>
            <p className="font-medium text-foreground">{formatDate(acquisition.valuation_date)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Valuator</p>
            <p className="font-medium text-foreground">{acquisition.valuator_name || '—'}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Land owners</CardTitle>
          {canEdit && <AddOwnerDialog acquisitionId={acquisition.id} />}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>National ID</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Ownership %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {acquisition.owners.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No owners recorded yet.
                  </TableCell>
                </TableRow>
              )}
              {acquisition.owners.map((owner) => (
                <TableRow key={owner.id}>
                  <TableCell className="font-medium text-foreground">{owner.full_name}</TableCell>
                  <TableCell>{owner.national_id || '—'}</TableCell>
                  <TableCell>{owner.phone || '—'}</TableCell>
                  <TableCell>{owner.ownership_percentage}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Negotiations</CardTitle>
          {canEdit && <AddNegotiationDialog acquisitionId={acquisition.id} />}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Offered</TableHead>
                <TableHead>Counter offer</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Logged by</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {acquisition.negotiations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No negotiations logged yet.
                  </TableCell>
                </TableRow>
              )}
              {acquisition.negotiations.map((negotiation) => (
                <TableRow key={negotiation.id}>
                  <TableCell className="font-medium text-foreground">{formatDate(negotiation.negotiated_on)}</TableCell>
                  <TableCell>{negotiation.offered_price ? formatTZS(negotiation.offered_price) : '—'}</TableCell>
                  <TableCell>
                    {negotiation.counter_offer_price ? formatTZS(negotiation.counter_offer_price) : '—'}
                  </TableCell>
                  <TableCell>{negotiation.notes || '—'}</TableCell>
                  <TableCell>{negotiation.negotiated_by_name ?? '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Purchase costs</CardTitle>
          {canEdit && <AddPurchaseCostDialog acquisitionId={acquisition.id} />}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date incurred</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {acquisition.purchase_costs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No purchase costs recorded yet.
                  </TableCell>
                </TableRow>
              )}
              {acquisition.purchase_costs.map((cost) => (
                <TableRow key={cost.id}>
                  <TableCell className="font-medium text-foreground">{COST_TYPE_LABELS[cost.cost_type]}</TableCell>
                  <TableCell>{cost.description || '—'}</TableCell>
                  <TableCell>{formatTZS(cost.amount)}</TableCell>
                  <TableCell>{formatDate(cost.incurred_on)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Attachments</CardTitle>
          {canEdit && <AddAttachmentDialog acquisitionId={acquisition.id} />}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Uploaded by</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {acquisition.attachments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No attachments uploaded yet.
                  </TableCell>
                </TableRow>
              )}
              {acquisition.attachments.map((attachment) => (
                <TableRow key={attachment.id}>
                  <TableCell className="font-medium text-foreground">
                    {DOCUMENT_TYPE_LABELS[attachment.document_type]}
                  </TableCell>
                  <TableCell>{attachment.description || '—'}</TableCell>
                  <TableCell>{attachment.uploaded_by_name ?? '—'}</TableCell>
                  <TableCell>
                    <a
                      href={attachment.file.startsWith('http') ? attachment.file : `${mediaOrigin}${attachment.file}`}
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

      {acquisition.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-foreground">{acquisition.description}</CardContent>
        </Card>
      )}

      {acquisition.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-foreground">{acquisition.notes}</CardContent>
        </Card>
      )}
    </div>
  )
}
