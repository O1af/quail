"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchChartData, updateChartData } from "./chart-helpers";
import { ChartData } from "@/lib/types/stores/chart";

// Define query keys here
export const chartQueryKeys = {
  all: ["charts"] as const, // Changed from "chart" to "charts" for consistency
  list: (userId: string | null) =>
    userId
      ? ([...chartQueryKeys.all, "list", userId] as const)
      : ([...chartQueryKeys.all, "list"] as const),
  detail: (
    chartId: string | null // Renamed from chartData to detail for clarity
  ) =>
    chartId
      ? ([...chartQueryKeys.all, "detail", chartId] as const)
      : ([...chartQueryKeys.all, "detail"] as const),
};

// Interface for the result
export interface ChartQueryResult {
  chartData: ChartData;
  title: string;
}

/**
 * Hook to fetch chart data by ID
 * @param chartId The ID of the chart to fetch
 * @returns Query result with chart data, loading and error states
 */
export function useChartData(chartId: string | null) {
  const isValidChartId = !!chartId && chartId !== "new";

  return useQuery<ChartQueryResult, Error>({
    queryKey: chartQueryKeys.detail(chartId), // Use the detail key
    queryFn: async () => {
      if (!chartId) throw new Error("Chart ID is required for fetching."); // Should not happen if enabled is false
      return fetchChartData(chartId);
    },
    enabled: isValidChartId, // Only run if chartId is valid and not 'new'
    staleTime: 5 * 60 * 1000, // Keep data fresh for 5 minutes
    refetchOnWindowFocus: false, // Optional: Adjust based on needs
    retry: 1, // Retry once on failure
  });
}

/**
 * Hook to save chart data
 * @returns Mutation object for saving chart data
 */
export function useSaveChart() {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    {
      chartId: string;
      chartData: ChartData; // Pass the base chartData object
      currJsx: string;
      title: string;
    }
  >({
    mutationFn: async ({ chartId, chartData, currJsx, title }) => {
      // The helper function now takes the base chartData and merges currJsx internally
      return updateChartData({ chartId, chartData, currJsx, title });
    },
    onSuccess: (data, variables) => {
      // Invalidate the specific chart data query to refetch fresh data
      queryClient.invalidateQueries({
        queryKey: chartQueryKeys.detail(variables.chartId), // Use the detail key
      });
      // Invalidate the list of charts query
      queryClient.invalidateQueries({
        queryKey: chartQueryKeys.list(null), // Invalidate the general list (adjust if user-specific lists are used)
      });
      // Optional: Update the query cache directly if needed for immediate UI update
      // queryClient.setQueryData(chartQueryKeys.detail(variables.chartId), updatedData);
    },
    onError: (error) => {
      console.error("Failed to save chart:", error);
      // Error handling can be done in the component calling the mutation
    },
  });
}
