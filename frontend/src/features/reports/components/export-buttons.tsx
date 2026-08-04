import { FileSpreadsheet, FileText } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'

import { downloadReportExport } from '../api/reports-api'
import type { ExportFormat, ReportType } from '../types'

interface ExportButtonsProps {
  report: ReportType
  params: Record<string, string | undefined>
  disabled?: boolean
}

export function ExportButtons({ report, params, disabled }: ExportButtonsProps) {
  const [pending, setPending] = useState<ExportFormat | null>(null)

  async function handleExport(format: ExportFormat) {
    setPending(format)
    try {
      await downloadReportExport(report, params, format)
    } finally {
      setPending(null)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled || pending !== null}
        onClick={() => handleExport('xlsx')}
      >
        <FileSpreadsheet /> {pending === 'xlsx' ? 'Exporting…' : 'Excel'}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled || pending !== null}
        onClick={() => handleExport('pdf')}
      >
        <FileText /> {pending === 'pdf' ? 'Exporting…' : 'PDF'}
      </Button>
    </div>
  )
}
