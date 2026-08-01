import { ArrowLeft } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { Button } from '@/components/ui/button'

import { SaleForm } from '../components/sale-form'

export function SaleCreatePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const reservationId = searchParams.get('reservation') ?? undefined
  const initialPlotId = searchParams.get('plot') ?? undefined

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/sales')} aria-label="Back to sales">
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="text-2xl font-semibold text-foreground">New sale</h1>
      </div>
      <SaleForm
        reservationId={reservationId}
        initialPlotId={initialPlotId}
        onSuccess={(sale) => navigate(`/sales/${sale.id}`)}
      />
    </div>
  )
}
