import { ArrowLeft, Pencil } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/features/auth/hooks/use-auth'

import { CommunicationLogPanel } from '../components/communication-log-panel'
import { NotesPanel } from '../components/notes-panel'
import { useCustomerQuery } from '../hooks/use-customers'
import { canEditCustomers } from '../lib/permissions'
import { CUSTOMER_TYPE_LABELS } from '../types'

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const canEdit = canEditCustomers(user?.permissions)
  const { data: customer, isLoading, isError } = useCustomerQuery(id)

  if (isLoading) {
    return <p className="text-muted-foreground">Loading customer…</p>
  }

  if (isError || !customer) {
    return <p className="text-destructive">Customer not found.</p>
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/crm/customers')}
            aria-label="Back to customers"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{customer.full_name}</h1>
            {customer.organization_name && (
              <p className="text-sm text-muted-foreground">{customer.organization_name}</p>
            )}
          </div>
          <Badge variant={customer.customer_type === 'organization' ? 'info' : 'secondary'}>
            {CUSTOMER_TYPE_LABELS[customer.customer_type]}
          </Badge>
        </div>
        {canEdit && (
          <Button asChild variant="outline">
            <Link to={`/crm/customers/${customer.id}/edit`}>
              <Pencil /> Edit
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">Phone</p>
            <p className="font-medium text-foreground">{customer.phone || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="font-medium text-foreground">{customer.email || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Address</p>
            <p className="font-medium text-foreground">{customer.address || '—'}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <NotesPanel targetType="customer" targetId={customer.id} />
        <CommunicationLogPanel targetType="customer" targetId={customer.id} />
      </div>
    </div>
  )
}
