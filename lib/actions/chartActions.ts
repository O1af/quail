"use server";

import { connectToMongo, getDatabase } from "@/components/stores/utils/mongo";
import { Collection, ObjectId } from "mongodb";
import { Chart } from "@/components/stores/dashboard_store";

function getChartsCollection(): Collection<Chart> {
  return getDatabase().collection<Chart>("charts");
}

/**
 * Update visualization data for a specific chart
 *
 * @param chartId - The ID of the chart to update
 * @param visualizationData - The visualization data to store
 * @returns A promise that resolves to true if the update was successful
 */
export async function updateChartVisualization(
  chartId: string,
  visualizationData: any
): Promise<boolean> {
  try {
    await connectToMongo();
    const collection = getChartsCollection();

    const result = await collection.updateOne(
      { _id: chartId },
      { $set: { visualization: visualizationData } }
    );

    return result.modifiedCount > 0;
  } catch (error) {
    console.error("Failed to update chart visualization:", error);
    throw new Error("Failed to update chart visualization");
  }
}

/**
 * Add visualization data to a chart that doesn't have one
 *
 * @param chartId - The ID of the chart to update
 * @param visualizationData - The visualization data to add
 * @returns Promise<boolean> - Whether the operation was successful
 */
export async function addChartVisualization(
  chartId: string,
  visualizationData: any
): Promise<boolean> {
  try {
    await connectToMongo();
    const collection = getChartsCollection();

    console.log("Adding visualization to chart:", chartId, visualizationData);
    const result = await collection.updateOne(
      { _id: chartId, visualization: { $exists: false } },
      { $set: { visualization: visualizationData } }
    );

    console.log(result);

    return result.modifiedCount > 0;
  } catch (error) {
    console.error("Failed to add chart visualization:", error);
    throw new Error("Failed to add chart visualization");
  }
}
/**
 * Load a chart given a user ID and chart ID
 *
 * @param userId - The ID of the user
 * @param chartId - The ID of the chart to retrieve
 * @returns A promise that resolves to the chart if found, or null if not found
 */
export async function loadChart(
  userId: string,
  chartId: string
): Promise<Chart | null> {
  try {
    await connectToMongo();
    const collection = getChartsCollection();

    const chart = await collection.findOne({ _id: chartId, userId: userId });

    return chart;
  } catch (error) {
    console.error("Failed to load chart:", error);
    throw new Error("Failed to load chart");
  }
}
