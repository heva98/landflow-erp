import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createPlot, deletePlot, fetchPlot, fetchPlots, updatePlot } from '../api/plots-api'
import type { PlotInput, PlotListParams } from '../types'

export function usePlotsQuery(params: PlotListParams = {}) {
  return useQuery({
    queryKey: ['plots', params],
    queryFn: () => fetchPlots(params),
  })
}

export function usePlotQuery(id: string | undefined) {
  return useQuery({
    queryKey: ['plots', id],
    queryFn: () => fetchPlot(id as string),
    enabled: Boolean(id),
  })
}

export function useCreatePlotMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createPlot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plots'] })
    },
  })
}

export function useUpdatePlotMutation(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: PlotInput) => updatePlot(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plots'] })
    },
  })
}

export function useDeletePlotMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deletePlot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plots'] })
    },
  })
}
