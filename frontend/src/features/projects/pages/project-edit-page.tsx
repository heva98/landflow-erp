import { useNavigate, useParams } from 'react-router-dom'

import { ProjectForm } from '../components/project-form'
import { useProjectQuery, useUpdateProjectMutation } from '../hooks/use-projects'

export function ProjectEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: project, isLoading } = useProjectQuery(id)
  const updateProject = useUpdateProjectMutation(id as string)

  if (isLoading || !project) {
    return <p className="text-muted-foreground">Loading project…</p>
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-foreground">Edit {project.name}</h1>
      <ProjectForm
        submitLabel="Save changes"
        defaultValues={{
          name: project.name,
          status: project.status,
          location: project.location,
          description: project.description,
          owner_id: project.owner?.id ?? '',
          master_plan_url: project.master_plan_url,
          total_area_sqm: Number(project.total_area_sqm),
          acquisition_cost: Number(project.acquisition_cost),
          development_cost: Number(project.development_cost),
          expected_revenue: Number(project.expected_revenue),
          start_date: project.start_date ?? '',
          expected_completion_date: project.expected_completion_date ?? '',
        }}
        onSubmit={async (input) => {
          await updateProject.mutateAsync(input)
          navigate(`/projects/${project.id}`)
        }}
      />
    </div>
  )
}
