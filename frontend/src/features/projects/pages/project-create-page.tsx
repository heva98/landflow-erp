import { useNavigate } from 'react-router-dom'

import { ProjectForm } from '../components/project-form'
import { useCreateProjectMutation } from '../hooks/use-projects'

export function ProjectCreatePage() {
  const navigate = useNavigate()
  const createProject = useCreateProjectMutation()

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-foreground">New project</h1>
      <ProjectForm
        submitLabel="Create project"
        onSubmit={async (input) => {
          const project = await createProject.mutateAsync(input)
          navigate(`/projects/${project.id}`)
        }}
      />
    </div>
  )
}
