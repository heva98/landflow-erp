import { Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/features/auth/hooks/use-auth'

import { SurveyStatusBadge } from '../components/status-badges'
import { useSurveysQuery } from '../hooks/use-surveys'
import { canManageSurveys } from '../lib/permissions'
import { SURVEY_STATUS_LABELS, SURVEY_STATUSES, type SurveyStatus } from '../types'

export function SurveysListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<SurveyStatus | 'all'>('all')
  const { user } = useAuth()
  const canAdd = canManageSurveys(user?.permissions)

  const { data, isLoading, isError } = useSurveysQuery({
    search: search || undefined,
    status: status === 'all' ? undefined : status,
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Surveys</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/surveys/directory">Companies &amp; surveyors</Link>
          </Button>
          {canAdd && (
            <Button asChild>
              <Link to="/surveys/new">
                <Plus /> New survey
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative w-72">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by reference or project"
            className="pl-8"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <Select value={status} onValueChange={(value) => setStatus(value as SurveyStatus | 'all')}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {SURVEY_STATUSES.map((value) => (
              <SelectItem key={value} value={value}>
                {SURVEY_STATUS_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Lead surveyor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Scheduled date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Loading surveys…
                </TableCell>
              </TableRow>
            )}
            {isError && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-destructive">
                  Failed to load surveys.
                </TableCell>
              </TableRow>
            )}
            {data && data.results.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No surveys yet.
                </TableCell>
              </TableRow>
            )}
            {data?.results.map((survey) => (
              <TableRow key={survey.id} className="cursor-pointer" onClick={() => navigate(`/surveys/${survey.id}`)}>
                <TableCell className="font-medium text-foreground">
                  <Link to={`/surveys/${survey.id}`} className="hover:underline">
                    {survey.reference_number}
                  </Link>
                </TableCell>
                <TableCell>{survey.project_name}</TableCell>
                <TableCell>{survey.company_name}</TableCell>
                <TableCell>{survey.lead_surveyor_name}</TableCell>
                <TableCell>
                  <SurveyStatusBadge status={survey.status} />
                </TableCell>
                <TableCell>{survey.scheduled_date ?? '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
