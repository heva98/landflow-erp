import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { fetchAllPlotsForMap, fetchAllProjectsForMap, updatePlotBoundary } from '../api/gis-api'

export function useMapPlotsQuery() {
  return useQuery({ queryKey: ['gis', 'plots'], queryFn: fetchAllPlotsForMap })
}

export function useMapProjectsQuery() {
  return useQuery({ queryKey: ['gis', 'projects'], queryFn: fetchAllProjectsForMap })
}

export function useSavePlotBoundaryMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ plotId, polygonGeojson }: { plotId: string; polygonGeojson: unknown }) =>
      updatePlotBoundary(plotId, polygonGeojson),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gis', 'plots'] })
      queryClient.invalidateQueries({ queryKey: ['plots'] })
    },
  })
}
