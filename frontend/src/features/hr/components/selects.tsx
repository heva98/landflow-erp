import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { useDepartmentsQuery, useEmployeesQuery, useLeaveTypesQuery } from '../hooks/use-hr'

export function DepartmentSelect({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const { data, isLoading } = useDepartmentsQuery()

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={isLoading ? 'Loading departments…' : 'No department'} />
      </SelectTrigger>
      <SelectContent>
        {data?.results.map((department) => (
          <SelectItem key={department.id} value={department.id}>
            {department.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function EmployeeSelect({
  value,
  onChange,
  placeholder = 'Select an employee',
}: {
  value: string
  onChange: (id: string) => void
  placeholder?: string
}) {
  const { data, isLoading } = useEmployeesQuery({ status: 'active' })

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={isLoading ? 'Loading employees…' : placeholder} />
      </SelectTrigger>
      <SelectContent>
        {data?.results.map((employee) => (
          <SelectItem key={employee.id} value={employee.id}>
            {employee.employee_number} · {employee.full_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function LeaveTypeSelect({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const { data, isLoading } = useLeaveTypesQuery()

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={isLoading ? 'Loading leave types…' : 'Select a leave type'} />
      </SelectTrigger>
      <SelectContent>
        {data?.results.map((leaveType) => (
          <SelectItem key={leaveType.id} value={leaveType.id}>
            {leaveType.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
