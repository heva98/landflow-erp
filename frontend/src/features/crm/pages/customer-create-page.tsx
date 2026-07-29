import { useNavigate } from 'react-router-dom'

import { CustomerForm } from '../components/customer-form'
import { useCreateCustomerMutation } from '../hooks/use-customers'

export function CustomerCreatePage() {
  const navigate = useNavigate()
  const createCustomer = useCreateCustomerMutation()

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-foreground">New customer</h1>
      <CustomerForm
        submitLabel="Create customer"
        onSubmit={async (input) => {
          const customer = await createCustomer.mutateAsync(input)
          navigate(`/crm/customers/${customer.id}`)
        }}
      />
    </div>
  )
}
