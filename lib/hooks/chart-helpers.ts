"use server";

import { ChartDocument, ChartData } from "@/lib/types/stores/chart";
import { loadChart, saveChart } from "@/components/stores/chart_store";
import { createClient } from "@/utils/supabase/server";

// Helper function to get the current user ID
export async function getCurrentUserId(): Promise<string> {
  const supabase = await createClient(); // Use server client - Added await
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Supabase auth error:", error.message);
    throw new Error(error.message || "Authentication failed");
  }
  if (!user) {
    throw new Error("User not authenticated");
  }
  return user.id;
}

// Fetch a chart by ID
export async function fetchChartData(chartId: string): Promise<{
  chartData: ChartData;
  title: string;
}> {
  // Errors will propagate up to React Query
  const userId = await getCurrentUserId();
  const chartDoc = await loadChart(chartId, userId);

  if (!chartDoc) {
    throw new Error(`Chart not found with ID: ${chartId}`);
  }

  return {
    chartData: chartDoc.data,
    title: chartDoc.title || "Untitled Chart",
  };
}

// Save chart changes
export async function updateChartData(params: {
  chartId: string;
  chartData: ChartData; // Base chart data
  currJsx: string; // The current JSX from the editor
  title: string;
}): Promise<void> {
  const { chartId, chartData, currJsx, title } = params;

  // Errors will propagate up to React Query
  const userId = await getCurrentUserId();

  // Create updated chart data structure for saving
  const updatedChartData: ChartData = {
    ...chartData, // Spread the existing data (like query, data rows)
    chartJsx: currJsx, // Update the JSX
  };

  // Pass the combined data, user ID, title, and chart ID to the save function
  await saveChart(updatedChartData, userId, title, chartId);
  // No return needed for void promise
}
