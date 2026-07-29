import { ArrowLeft, Pencil } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatTZS } from '@/lib/utils'

import { ProjectStatusBadge } from '../components/project-status-badge'
import { useProjectQuery } from '../hooks/use-projects'

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString('en-GB') : '—'
}

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: project, isLoading, isError } = useProjectQuery(id)

  if (isLoading) {
    return <p className="text-muted-foreground">Loading project…</p>
  }

  if (isError || !project) {
    return <p className="text-destructive">Project not found.</p>
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/projects')} aria-label="Back to projects">
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{project.name}</h1>
            <p className="text-sm text-muted-foreground">{project.location}</p>
          </div>
          <ProjectStatusBadge status={project.status} />
        </div>
        <Button asChild variant="outline">
          <Link to={`/projects/${project.id}/edit`}>
            <Pencil /> Edit
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total area</CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-semibold text-foreground">
            {Number(project.total_area_sqm).toLocaleString()} sqm
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Expected revenue</CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-semibold text-foreground">
            {formatTZS(project.expected_revenue)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>ROI</CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-semibold text-foreground">
            {project.roi_percent === null ? '—' : `${Number(project.roi_percent).toFixed(1)}%`}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Costs & timeline</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">Acquisition cost</p>
            <p className="font-medium text-foreground">{formatTZS(project.acquisition_cost)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Development cost</p>
            <p className="font-medium text-foreground">{formatTZS(project.development_cost)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Start date</p>
            <p className="font-medium text-foreground">{formatDate(project.start_date)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Expected completion</p>
            <p className="font-medium text-foreground">{formatDate(project.expected_completion_date)}</p>
          </div>
        </CardContent>
      </Card>

      {project.master_plan_url && (
        <Card>
          <CardHeader>
            <CardTitle>Master plan</CardTitle>
          </CardHeader>
          <CardContent>
            <a
              href={project.master_plan_url}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-primary underline underline-offset-4"
            >
              View master plan
            </a>
          </CardContent>
        </Card>
      )}

      {project.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-foreground">{project.description}</CardContent>
        </Card>
      )}
    </div>
  )
}
