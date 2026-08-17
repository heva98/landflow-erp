import { useNavigate, useParams } from 'react-router-dom'

import { EmployeeForm } from '../components/employee-form'
import { useEmployeeQuery, useUpdateEmployeeMutation } from '../hooks/use-hr'

export function EmployeeEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: employee, isLoading } = useEmployeeQuery(id)
  const updateEmployee = useUpdateEmployeeMutation(id as string)

  if (isLoading || !employee) {
    return <p className="text-muted-foreground">Loading employee…</p>
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-foreground">Edit {employee.full_name}</h1>
      <EmployeeForm
        submitLabel="Save changes"
        defaultValues={{
          full_name: employee.full_name,
          job_title: employee.job_title,
          department: employee.department ?? '',
          manager: employee.manager ?? '',
          employment_type: employee.employment_type,
          phone: employee.phone,
          email: employee.email,
          national_id: employee.national_id,
          address: employee.address,
          date_of_birth: employee.date_of_birth ?? '',
          hire_date: employee.hire_date,
          basic_salary: Number(employee.basic_salary),
          bank_name: employee.bank_name,
          bank_account_number: employee.bank_account_number,
          emergency_contact_name: employee.emergency_contact_name,
          emergency_contact_phone: employee.emergency_contact_phone,
          notes: employee.notes,
        }}
        onSubmit={async (input) => {
          await updateEmployee.mutateAsync(input)
          navigate(`/hr/employees/${employee.id}`)
        }}
      />
    </div>
  )
}
