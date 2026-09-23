import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useEmployeesQuery } from '@/features/hr/hooks/use-hr'

import { useAgentsQuery, useCommissionPlansQuery, useTerritoriesQuery } from '../hooks/use-agents'

export function TerritorySelect({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const { data, isLoading } = useTerritoriesQuery()

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={isLoading ? 'Loading territories…' : 'No territory'} />
      </SelectTrigger>
      <SelectContent>
        {data?.results.map((territory) => (
          <SelectItem key={territory.id} value={territory.id}>
            {territory.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function CommissionPlanSelect({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const { data, isLoading } = useCommissionPlansQuery({ is_active: true })

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={isLoading ? 'Loading plans…' : 'No commission plan'} />
      </SelectTrigger>
      <SelectContent>
        {data?.results.map((plan) => (
          <SelectItem key={plan.id} value={plan.id}>
            {plan.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/** Employees who don't already have an Agent profile — an Agent is a OneToOne extension of Employee. */
export function AvailableEmployeeSelect({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const { data: employees, isLoading: loadingEmployees } = useEmployeesQuery({ status: 'active' })
  const { data: agents, isLoading: loadingAgents } = useAgentsQuery()
  const agentEmployeeIds = new Set((agents?.results ?? []).map((agent) => agent.employee))
  const available = (employees?.results ?? []).filter(
    (employee) => employee.id === value || !agentEmployeeIds.has(employee.id),
  )

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={loadingEmployees || loadingAgents ? 'Loading employees…' : 'Select an employee'} />
      </SelectTrigger>
      <SelectContent>
        {available.map((employee) => (
          <SelectItem key={employee.id} value={employee.id}>
            {employee.employee_number} · {employee.full_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
