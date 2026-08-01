import { ArrowLeft, FileText } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { canCreatePaymentPlans } from '@/features/installments/lib/permissions'
import { formatTZS } from '@/lib/utils'

import { SaleStatusBadge } from '../components/sale-status-badge'
import { useCancelSaleMutation, useSaleQuery } from '../hooks/use-sales'
import { canManageSales } from '../lib/permissions'
import { PAYMENT_METHOD_LABELS, SALE_TYPE_LABELS } from '../types'

export function SaleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const canManage = canManageSales(user?.permissions)
  const canSetUpPaymentPlan = canCreatePaymentPlans(user?.permissions)
  const { data: sale, isLoading, isError } = useSaleQuery(id)
  const cancelSale = useCancelSaleMutation()

  if (isLoading) {
    return <p className="text-muted-foreground">Loading sale…</p>
  }

  if (isError || !sale) {
    return <p className="text-destructive">Sale not found.</p>
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/sales')} aria-label="Back to sales">
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{sale.sale_number}</h1>
            <p className="text-sm text-muted-foreground">
              Plot {sale.plot_number} · {sale.customer_name}
            </p>
          </div>
          <SaleStatusBadge status={sale.status} />
        </div>
        <div className="flex gap-2">
          {canSetUpPaymentPlan && sale.sale_type === 'installment' && sale.status === 'active' && Number(sale.balance_due) > 0 && (
            <Button asChild variant="outline">
              <Link to={`/installments/new?sale=${sale.id}`}>Set up payment plan</Link>
            </Button>
          )}
          {canManage && sale.status === 'active' && (
            <Button
              variant="destructive"
              disabled={cancelSale.isPending}
              onClick={() => cancelSale.mutate(sale.id)}
            >
              Cancel sale
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Sale type</CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-semibold text-foreground">
            {SALE_TYPE_LABELS[sale.sale_type]}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Sale price</CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-semibold text-foreground">
            {formatTZS(sale.sale_price)}
            {Number(sale.discount) > 0 && (
              <p className="mt-1 text-xs font-normal text-muted-foreground">
                {formatTZS(sale.discount)} discount applied
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Down payment</CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-semibold text-foreground">
            {formatTZS(sale.down_payment)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Balance due</CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-semibold text-foreground">
            {formatTZS(sale.balance_due)}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm">
            <div>
              <p className="font-medium text-foreground">{sale.invoice.invoice_number}</p>
              <p className="text-muted-foreground">
                {formatTZS(sale.invoice.amount)} · issued {new Date(sale.invoice.issued_at).toLocaleString()}
              </p>
            </div>
            {sale.invoice.file && (
              <Button asChild variant="outline" size="sm">
                <a href={sale.invoice.file} target="_blank" rel="noreferrer">
                  <FileText /> View PDF
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Receipts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt #</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Received at</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sale.receipts.map((receipt) => (
                <TableRow key={receipt.id}>
                  <TableCell className="font-medium text-foreground">{receipt.receipt_number}</TableCell>
                  <TableCell>{formatTZS(receipt.amount)}</TableCell>
                  <TableCell>{PAYMENT_METHOD_LABELS[receipt.payment_method]}</TableCell>
                  <TableCell>{new Date(receipt.received_at).toLocaleString()}</TableCell>
                  <TableCell>
                    {receipt.file && (
                      <Button asChild variant="outline" size="sm">
                        <a href={receipt.file} target="_blank" rel="noreferrer">
                          <FileText /> View PDF
                        </a>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {sale.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-foreground">{sale.notes}</CardContent>
        </Card>
      )}
    </div>
  )
}
