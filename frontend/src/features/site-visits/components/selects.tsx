import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useLeadsQuery } from '@/features/crm/hooks/use-leads'
import { useProjectsQuery } from '@/features/projects/hooks/use-projects'

import { useBusesQuery } from '../hooks/use-site-visits'

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

export function BusSelect({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const { data, isLoading } = useBusesQuery({ is_active: true })

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={isLoading ? 'Loading buses…' : 'No bus assigned'} />
      </SelectTrigger>
      <SelectContent>
        {data?.results.map((bus) => (
          <SelectItem key={bus.id} value={bus.id}>
            {bus.registration_number} {bus.driver_name ? `· ${bus.driver_name}` : ''}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function LeadSelect({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const { data, isLoading } = useLeadsQuery({ page_size: 50 })

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={isLoading ? 'Loading leads…' : 'Select a lead'} />
      </SelectTrigger>
      <SelectContent>
        {data?.results.map((lead) => (
          <SelectItem key={lead.id} value={lead.id}>
            {lead.full_name} {lead.phone ? `· ${lead.phone}` : ''}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
