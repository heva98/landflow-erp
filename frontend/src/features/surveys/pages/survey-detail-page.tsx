import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/features/auth/hooks/use-auth'

import { AddBeaconDialog } from '../components/add-beacon-dialog'
import { AddSurveyDocumentDialog } from '../components/add-survey-document-dialog'
import { CreateSubdivisionDialog } from '../components/create-subdivision-dialog'
import { SurveyStatusBadge } from '../components/status-badges'
import { SurveyWorkflowActions } from '../components/survey-workflow-actions'
import { useSurveyQuery } from '../hooks/use-surveys'
import { canManageSurveys } from '../lib/permissions'
import { BEACON_CONDITION_LABELS, BEACON_TYPE_LABELS, SURVEY_DOCUMENT_TYPE_LABELS } from '../types'

const apiBaseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1'
const mediaOrigin = apiBaseURL.replace(/\/api\/v1\/?$/, '')

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString('en-GB') : '—'
}

export function SurveyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const canManage = canManageSurveys(user?.permissions)
  const { data: survey, isLoading, isError } = useSurveyQuery(id)

  if (isLoading) {
    return <p className="text-muted-foreground">Loading survey…</p>
  }

  if (isError || !survey) {
    return <p className="text-destructive">Survey not found.</p>
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/surveys')} aria-label="Back to surveys">
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{survey.reference_number}</h1>
            <p className="text-sm text-muted-foreground">
              {survey.project_name} · {survey.company_name} · {survey.lead_surveyor_name}
            </p>
          </div>
          <SurveyStatusBadge status={survey.status} />
        </div>
        <SurveyWorkflowActions survey={survey} />
      </div>

      {survey.status === 'rejected' && survey.rejection_reason && (
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Rejection reason</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-foreground">{survey.rejection_reason}</CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Coordinate system</CardTitle>
          </CardHeader>
          <CardContent className="text-sm font-semibold text-foreground">{survey.coordinate_system}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Area surveyed</CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-semibold text-foreground">
            {survey.area_surveyed_sqm ? `${Number(survey.area_surveyed_sqm).toLocaleString()} sqm` : '—'}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Scheduled date</CardTitle>
          </CardHeader>
          <CardContent className="text-sm font-semibold text-foreground">{formatDate(survey.scheduled_date)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Completed date</CardTitle>
          </CardHeader>
          <CardContent className="text-sm font-semibold text-foreground">{formatDate(survey.completed_date)}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Subdivision</CardTitle>
          {canManage && !survey.has_subdivision && <CreateSubdivisionDialog surveyId={survey.id} />}
        </CardHeader>
        <CardContent>
          {survey.has_subdivision ? (
            <Link
              to={`/surveys/${survey.id}/subdivision`}
              className="text-sm text-primary underline underline-offset-4"
            >
              View subdivision
            </Link>
          ) : (
            <p className="text-sm text-muted-foreground">No subdivision created yet for this survey.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Beacons</CardTitle>
          {canManage && <AddBeaconDialog surveyId={survey.id} />}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Number</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Coordinates</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {survey.beacons.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No beacons recorded yet.
                  </TableCell>
                </TableRow>
              )}
              {survey.beacons.map((beacon) => (
                <TableRow key={beacon.id}>
                  <TableCell className="font-medium text-foreground">{beacon.beacon_number}</TableCell>
                  <TableCell>{BEACON_TYPE_LABELS[beacon.beacon_type]}</TableCell>
                  <TableCell>{BEACON_CONDITION_LABELS[beacon.condition]}</TableCell>
                  <TableCell>
                    {beacon.latitude && beacon.longitude ? `${beacon.latitude}, ${beacon.longitude}` : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Documents</CardTitle>
          {canManage && <AddSurveyDocumentDialog surveyId={survey.id} />}
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
              {survey.documents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No documents uploaded yet.
                  </TableCell>
                </TableRow>
              )}
              {survey.documents.map((document) => (
                <TableRow key={document.id}>
                  <TableCell className="font-medium text-foreground">
                    {SURVEY_DOCUMENT_TYPE_LABELS[document.document_type]}
                  </TableCell>
                  <TableCell>{document.description || '—'}</TableCell>
                  <TableCell>{document.uploaded_by_name ?? '—'}</TableCell>
                  <TableCell>
                    <a
                      href={document.file.startsWith('http') ? document.file : `${mediaOrigin}${document.file}`}
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

      {survey.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-foreground">{survey.notes}</CardContent>
        </Card>
      )}
    </div>
  )
}
