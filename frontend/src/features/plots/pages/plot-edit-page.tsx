import { useNavigate, useParams } from 'react-router-dom'

import { PlotForm } from '../components/plot-form'
import { usePlotQuery, useUpdatePlotMutation } from '../hooks/use-plots'

export function PlotEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: plot, isLoading } = usePlotQuery(id)
  const updatePlot = useUpdatePlotMutation(id as string)

  if (isLoading || !plot) {
    return <p className="text-muted-foreground">Loading plot…</p>
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-foreground">Edit {plot.plot_number}</h1>
      <PlotForm
        submitLabel="Save changes"
        defaultValues={{
          project: plot.project,
          plot_number: plot.plot_number,
          block: plot.block,
          street: plot.street,
          status: plot.status,
          area_sqm: Number(plot.area_sqm),
          price: Number(plot.price),
          discount: Number(plot.discount),
          google_maps_url: plot.google_maps_url,
          current_owner: plot.current_owner,
        }}
        onSubmit={async (input) => {
          await updatePlot.mutateAsync(input)
          navigate(`/plots/${plot.id}`)
        }}
      />
    </div>
  )
}
