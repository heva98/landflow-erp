import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { cn } from '@/lib/utils'

import { CashFlowReportView } from '../components/cash-flow-report-view'
import { InstallmentReportView } from '../components/installment-report-view'
import { LandInventoryReportView } from '../components/land-inventory-report-view'
import { LeadReportView } from '../components/lead-report-view'
import { SalesReportView } from '../components/sales-report-view'
import {
  canViewCashFlowReport,
  canViewInstallmentReport,
  canViewLandInventoryReport,
  canViewLeadReport,
  canViewSalesReport,
} from '../lib/permissions'
import { REPORT_TYPE_LABELS, type ReportType } from '../types'

export function ReportsPage() {
  const { user } = useAuth()
  const permissions = user?.permissions

  const availableReports = useMemo(() => {
    const reports: ReportType[] = []
    if (canViewSalesReport(permissions)) reports.push('sales')
    if (canViewInstallmentReport(permissions)) reports.push('installments')
    if (canViewLeadReport(permissions)) reports.push('leads')
    if (canViewLandInventoryReport(permissions)) reports.push('land-inventory')
    if (canViewCashFlowReport(permissions)) reports.push('cash-flow')
    return reports
  }, [permissions])

  const [activeReport, setActiveReport] = useState<ReportType | null>(availableReports[0] ?? null)
  const selected = activeReport && availableReports.includes(activeReport) ? activeReport : availableReports[0]

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-foreground">Reports</h1>

      {availableReports.length === 0 ? (
        <p className="text-muted-foreground">You don't have access to any reports.</p>
      ) : (
        <>
          <div className="flex w-fit flex-wrap rounded-lg bg-card p-1 ring-1 ring-foreground/10">
            {availableReports.map((report) => (
              <Button
                key={report}
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setActiveReport(report)}
                className={cn(
                  'rounded-md',
                  selected === report ? 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground' : '',
                )}
              >
                {REPORT_TYPE_LABELS[report]}
              </Button>
            ))}
          </div>

          {selected === 'sales' && <SalesReportView />}
          {selected === 'installments' && <InstallmentReportView />}
          {selected === 'leads' && <LeadReportView />}
          {selected === 'land-inventory' && <LandInventoryReportView />}
          {selected === 'cash-flow' && <CashFlowReportView />}
        </>
      )}
    </div>
  )
}
