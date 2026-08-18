import { useState } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ReportTable, type ReportColumn } from '@/features/reports/components/report-table'
import { SummaryCardsRow } from '@/features/reports/components/summary-cards'
import { useProjectsQuery } from '@/features/projects/hooks/use-projects'
import { formatTZS } from '@/lib/utils'

import {
  useAvailableAreaQuery,
  useFutureProjectsQuery,
  useInventoryOverviewQuery,
  useReservedPlotsQuery,
  useTransferredPlotsQuery,
  useUnsoldPlotsQuery,
} from '../hooks/use-inventory'
import type { AvailableAreaRow, FutureProjectRow, InventoryPlotRow } from '../types'

const PLOT_COLUMNS: ReportColumn<InventoryPlotRow>[] = [
  { key: 'project', label: 'Project' },
  { key: 'plot_number', label: 'Plot #' },
  { key: 'block', label: 'Block' },
  { key: 'street', label: 'Street' },
  { key: 'area_sqm', label: 'Area (sqm)', align: 'right' },
  { key: 'price', label: 'Price', align: 'right', render: (row) => formatTZS(row.price) },
  { key: 'final_price', label: 'Final Price', align: 'right', render: (row) => formatTZS(row.final_price) },
  { key: 'owner', label: 'Owner' },
]

const AVAILABLE_AREA_COLUMNS: ReportColumn<AvailableAreaRow>[] = [
  { key: 'project', label: 'Project' },
  { key: 'available_plot_count', label: 'Available Plots', align: 'right' },
  { key: 'available_area_sqm', label: 'Available Area (sqm)', align: 'right' },
]

const FUTURE_PROJECT_COLUMNS: ReportColumn<FutureProjectRow>[] = [
  { key: 'project', label: 'Project' },
  { key: 'status', label: 'Status' },
  { key: 'location', label: 'Location' },
  { key: 'total_area_sqm', label: 'Total Area (sqm)', align: 'right' },
  { key: 'plot_count', label: 'Plots', align: 'right' },
  { key: 'start_date', label: 'Start Date' },
  { key: 'expected_completion_date', label: 'Expected Completion' },
]

function ProjectFilter({ project, onChange }: { project: string; onChange: (value: string) => void }) {
  const { data: projects } = useProjectsQuery({ page_size: 200 })
  return (
    <div className="flex flex-col gap-1.5">
      <Label>Project</Label>
      <Select value={project} onValueChange={onChange}>
        <SelectTrigger className="w-56">
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
  )
}

function UnsoldTab({ project }: { project?: string }) {
  const { data, isLoading, isError } = useUnsoldPlotsQuery({ project })
  return (
    <div className="flex flex-col gap-4">
      {data && (
        <SummaryCardsRow
          items={[
            { label: 'Unsold Plots', value: data.summary.count },
            { label: 'Total Area (sqm)', value: Number(data.summary.total_area_sqm).toLocaleString() },
            { label: 'Total Price', value: formatTZS(data.summary.total_price) },
          ]}
        />
      )}
      <ReportTable
        columns={PLOT_COLUMNS}
        rows={data?.rows}
        isLoading={isLoading}
        isError={isError}
        emptyMessage="No unsold plots match this filter."
        getRowKey={(row) => `${row.project}-${row.plot_number}`}
      />
    </div>
  )
}

function ReservedTab({ project }: { project?: string }) {
  const { data, isLoading, isError } = useReservedPlotsQuery({ project })
  return (
    <div className="flex flex-col gap-4">
      {data && (
        <SummaryCardsRow
          items={[
            { label: 'Reserved Plots', value: data.summary.count },
            { label: 'Total Area (sqm)', value: Number(data.summary.total_area_sqm).toLocaleString() },
            { label: 'Total Price', value: formatTZS(data.summary.total_price) },
          ]}
        />
      )}
      <ReportTable
        columns={PLOT_COLUMNS}
        rows={data?.rows}
        isLoading={isLoading}
        isError={isError}
        emptyMessage="No reserved plots match this filter."
        getRowKey={(row) => `${row.project}-${row.plot_number}`}
      />
    </div>
  )
}

function TransferredTab({ project }: { project?: string }) {
  const { data, isLoading, isError } = useTransferredPlotsQuery({ project })
  return (
    <div className="flex flex-col gap-4">
      {data && (
        <SummaryCardsRow
          items={[
            { label: 'Transferred Plots', value: data.summary.count },
            { label: 'Total Area (sqm)', value: Number(data.summary.total_area_sqm).toLocaleString() },
            { label: 'Total Price', value: formatTZS(data.summary.total_price) },
          ]}
        />
      )}
      <ReportTable
        columns={PLOT_COLUMNS}
        rows={data?.rows}
        isLoading={isLoading}
        isError={isError}
        emptyMessage="No transferred plots match this filter."
        getRowKey={(row) => `${row.project}-${row.plot_number}`}
      />
    </div>
  )
}

function AvailableAreaTab({ project }: { project?: string }) {
  const { data, isLoading, isError } = useAvailableAreaQuery({ project })
  return (
    <div className="flex flex-col gap-4">
      {data && (
        <SummaryCardsRow
          items={[
            { label: 'Projects with Available Land', value: data.summary.count },
            { label: 'Total Available Area (sqm)', value: Number(data.summary.total_area_sqm).toLocaleString() },
          ]}
        />
      )}
      <ReportTable
        columns={AVAILABLE_AREA_COLUMNS}
        rows={data?.rows}
        isLoading={isLoading}
        isError={isError}
        emptyMessage="No available land matches this filter."
        getRowKey={(row) => row.project}
      />
    </div>
  )
}

function FutureProjectsTab() {
  const { data, isLoading, isError } = useFutureProjectsQuery()
  return (
    <div className="flex flex-col gap-4">
      {data && (
        <SummaryCardsRow
          items={[
            { label: 'Future Projects', value: data.summary.count },
            { label: 'Total Area (sqm)', value: Number(data.summary.total_area_sqm).toLocaleString() },
          ]}
        />
      )}
      <ReportTable
        columns={FUTURE_PROJECT_COLUMNS}
        rows={data?.rows}
        isLoading={isLoading}
        isError={isError}
        emptyMessage="No projects are in Planning or Development."
        getRowKey={(row) => row.project}
      />
    </div>
  )
}

export function InventoryPage() {
  const [project, setProject] = useState('all')
  const projectParam = project === 'all' ? undefined : project
  const { data: overview } = useInventoryOverviewQuery()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-2xl font-semibold text-foreground">Inventory</h1>
        <ProjectFilter project={project} onChange={setProject} />
      </div>

      {overview && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>Unsold</CardTitle>
            </CardHeader>
            <CardContent className="text-xl font-semibold text-foreground">
              {overview.unsold.count} <span className="text-sm font-normal text-muted-foreground">plots</span>
              <p className="text-sm font-normal text-muted-foreground">
                {Number(overview.unsold.area_sqm).toLocaleString()} sqm
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Reserved</CardTitle>
            </CardHeader>
            <CardContent className="text-xl font-semibold text-foreground">
              {overview.reserved.count} <span className="text-sm font-normal text-muted-foreground">plots</span>
              <p className="text-sm font-normal text-muted-foreground">
                {Number(overview.reserved.area_sqm).toLocaleString()} sqm
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Transferred</CardTitle>
            </CardHeader>
            <CardContent className="text-xl font-semibold text-foreground">
              {overview.transferred.count} <span className="text-sm font-normal text-muted-foreground">plots</span>
              <p className="text-sm font-normal text-muted-foreground">
                {Number(overview.transferred.area_sqm).toLocaleString()} sqm
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Future Projects</CardTitle>
            </CardHeader>
            <CardContent className="text-xl font-semibold text-foreground">
              {overview.future_projects_count}
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="unsold">
        <TabsList>
          <TabsTrigger value="unsold">Unsold</TabsTrigger>
          <TabsTrigger value="reserved">Reserved</TabsTrigger>
          <TabsTrigger value="transferred">Transferred</TabsTrigger>
          <TabsTrigger value="available-area">Available Area</TabsTrigger>
          <TabsTrigger value="future-projects">Future Projects</TabsTrigger>
        </TabsList>
        <TabsContent value="unsold">
          <UnsoldTab project={projectParam} />
        </TabsContent>
        <TabsContent value="reserved">
          <ReservedTab project={projectParam} />
        </TabsContent>
        <TabsContent value="transferred">
          <TransferredTab project={projectParam} />
        </TabsContent>
        <TabsContent value="available-area">
          <AvailableAreaTab project={projectParam} />
        </TabsContent>
        <TabsContent value="future-projects">
          <FutureProjectsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
