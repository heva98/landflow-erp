import { Circle, Popup } from 'react-leaflet'
import { Link } from 'react-router-dom'

import { ProjectStatusBadge } from '@/features/projects/components/project-status-badge'
import type { Project } from '@/features/projects/types'

import { toLatLngExpression } from '../lib/geo'

/**
 * Projects don't have a stored boundary polygon (only a center point), so
 * "boundary" here is approximated as a circle sized from the project's total
 * area — a visual guide, not a surveyed outline.
 */
function radiusFromAreaSqm(totalAreaSqm: string): number {
  const area = Number(totalAreaSqm)
  if (!Number.isFinite(area) || area <= 0) return 150
  return Math.sqrt(area / Math.PI)
}

export function ProjectsLayer({ projects }: { projects: Project[] }) {
  return (
    <>
      {projects
        .filter((project) => project.latitude && project.longitude)
        .map((project) => (
          <Circle
            key={project.id}
            center={toLatLngExpression(project.latitude as string, project.longitude as string)}
            radius={radiusFromAreaSqm(project.total_area_sqm)}
            pathOptions={{ color: 'var(--color-primary)', fillOpacity: 0.05, weight: 2, dashArray: '6 4' }}
          >
            <Popup>
              <div className="flex flex-col gap-1.5 text-sm">
                <p className="font-semibold text-foreground">{project.name}</p>
                <ProjectStatusBadge status={project.status} />
                <p>{project.location}</p>
                <p>{Number(project.total_area_sqm).toLocaleString()} sqm</p>
                <Link to={`/projects/${project.id}`} className="text-primary underline underline-offset-4">
                  View project
                </Link>
              </div>
            </Popup>
          </Circle>
        ))}
    </>
  )
}
