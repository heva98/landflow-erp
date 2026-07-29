import { useNavigate, useParams } from 'react-router-dom'

import { CustomerForm } from '../components/customer-form'
import { useCustomerQuery, useUpdateCustomerMutation } from '../hooks/use-customers'

export function CustomerEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: customer, isLoading } = useCustomerQuery(id)
  const updateCustomer = useUpdateCustomerMutation(id as string)

  if (isLoading || !customer) {
    return <p className="text-muted-foreground">Loading customer…</p>
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-foreground">Edit {customer.full_name}</h1>
      <CustomerForm
        submitLabel="Save changes"
        defaultValues={{
          customer_type: customer.customer_type,
          full_name: customer.full_name,
          phone: customer.phone,
          email: customer.email,
          national_id: customer.national_id,
          address: customer.address,
        }}
        onSubmit={async (input) => {
          await updateCustomer.mutateAsync(input)
          navigate(`/crm/customers/${customer.id}`)
        }}
      />
    </div>
  )
}
