import { useNavigate } from 'react-router-dom'

import { EmployeeForm } from '../components/employee-form'
import { useCreateEmployeeMutation } from '../hooks/use-hr'

export function EmployeeCreatePage() {
  const navigate = useNavigate()
  const createEmployee = useCreateEmployeeMutation()

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-foreground">New employee</h1>
      <EmployeeForm
        submitLabel="Create employee"
        onSubmit={async (input) => {
          const employee = await createEmployee.mutateAsync(input)
          navigate(`/hr/employees/${employee.id}`)
        }}
      />
    </div>
  )
}
