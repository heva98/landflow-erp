import { useState } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PLOT_STATUS_LABELS, PLOT_STATUSES } from '@/features/plots/types'
import { useProjectsQuery } from '@/features/projects/hooks/use-projects'
import { formatTZS } from '@/lib/utils'

import { useLandInventoryReportQuery } from '../hooks/use-reports'
import type { LandInventoryReportRow } from '../types'
import { ExportButtons } from './export-buttons'
import { ReportTable, type ReportColumn } from './report-table'
import { SummaryCardsRow } from './summary-cards'

const COLUMNS: ReportColumn<LandInventoryReportRow>[] = [
  { key: 'project', label: 'Project' },
  { key: 'plot_number', label: 'Plot #' },
  { key: 'block', label: 'Block' },
  { key: 'street', label: 'Street' },
  { key: 'status', label: 'Status' },
  { key: 'area_sqm', label: 'Area (sqm)', align: 'right' },
  { key: 'price', label: 'Price', align: 'right', render: (row) => formatTZS(row.price) },
  { key: 'final_price', label: 'Final Price', align: 'right', render: (row) => formatTZS(row.final_price) },
  { key: 'owner', label: 'Owner' },
]

export function LandInventoryReportView() {
  const [project, setProject] = useState('all')
  const [status, setStatus] = useState('all')

  const { data: projects } = useProjectsQuery({ page_size: 200 })

  const params = {
    project: project === 'all' ? undefined : project,
    status: status === 'all' ? undefined : status,
  }

  const { data, isLoading, isError } = useLandInventoryReportQuery(params)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>Project</Label>
            <Select value={project} onValueChange={setProject}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All projects</SelectItem>
                {projects?.results.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {PLOT_STATUSES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {PLOT_STATUS_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <ExportButtons report="land-inventory" params={params} disabled={isLoading || isError} />
      </div>

      {data && (
        <>
          <SummaryCardsRow
            items={[
              { label: 'Number of Plots', value: data.summary.count },
              { label: 'Total Area (sqm)', value: Number(data.summary.total_area_sqm).toLocaleString() },
              { label: 'Total Price', value: formatTZS(data.summary.total_price) },
              { label: 'Total Final Price', value: formatTZS(data.summary.total_final_price) },
            ]}
          />
          <Card>
            <CardHeader>
              <CardTitle>By status</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-foreground">
              {Object.entries(data.summary.by_status).map(([key, count]) => (
                <span key={key}>
                  {PLOT_STATUS_LABELS[key as keyof typeof PLOT_STATUS_LABELS] ?? key}: <strong>{count}</strong>
                </span>
              ))}
            </CardContent>
          </Card>
        </>
      )}

      <ReportTable
        columns={COLUMNS}
        rows={data?.rows}
        isLoading={isLoading}
        isError={isError}
        emptyMessage="No plots match these filters."
        getRowKey={(row) => `${row.project}-${row.plot_number}`}
      />
    </div>
  )
}
