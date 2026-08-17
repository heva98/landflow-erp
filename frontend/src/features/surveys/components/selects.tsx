import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useProjectsQuery } from '@/features/projects/hooks/use-projects'

import { useSurveyCompaniesQuery, useSurveyorsQuery } from '../hooks/use-surveys'

export function ProjectSelect({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const { data, isLoading } = useProjectsQuery()

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={isLoading ? 'Loading projects…' : 'Select a project'} />
      </SelectTrigger>
      <SelectContent>
        {data?.results.map((project) => (
          <SelectItem key={project.id} value={project.id}>
            {project.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function SurveyCompanySelect({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const { data, isLoading } = useSurveyCompaniesQuery()

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={isLoading ? 'Loading companies…' : 'Select a survey company'} />
      </SelectTrigger>
      <SelectContent>
        {data?.results.map((company) => (
          <SelectItem key={company.id} value={company.id}>
            {company.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/** Surveyors are scoped to whichever company is currently selected in the form. */
export function SurveyorSelect({
  companyId,
  value,
  onChange,
}: {
  companyId: string | undefined
  value: string
  onChange: (id: string) => void
}) {
  const { data, isLoading } = useSurveyorsQuery({ company: companyId })

  return (
    <Select value={value} onValueChange={onChange} disabled={!companyId}>
      <SelectTrigger>
        <SelectValue placeholder={!companyId ? 'Select a company first' : isLoading ? 'Loading…' : 'Select a surveyor'} />
      </SelectTrigger>
      <SelectContent>
        {data?.results.map((surveyor) => (
          <SelectItem key={surveyor.id} value={surveyor.id}>
            {surveyor.full_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
