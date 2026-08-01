import { ArrowLeft } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { Button } from '@/components/ui/button'

import { PaymentPlanForm } from '../components/payment-plan-form'

export function PaymentPlanCreatePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialSaleId = searchParams.get('sale') ?? undefined

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/installments')} aria-label="Back to installments">
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="text-2xl font-semibold text-foreground">New payment plan</h1>
      </div>
      <PaymentPlanForm initialSaleId={initialSaleId} onSuccess={(plan) => navigate(`/installments/${plan.id}`)} />
    </div>
  )
}
