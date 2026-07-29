import { useNavigate } from 'react-router-dom'

import { PlotForm } from '../components/plot-form'
import { useCreatePlotMutation } from '../hooks/use-plots'

export function PlotCreatePage() {
  const navigate = useNavigate()
  const createPlot = useCreatePlotMutation()

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-foreground">New plot</h1>
      <PlotForm
        submitLabel="Create plot"
        onSubmit={async (input) => {
          const plot = await createPlot.mutateAsync(input)
          navigate(`/plots/${plot.id}`)
        }}
      />
    </div>
  )
}
