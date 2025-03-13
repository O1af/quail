"use server";

import { connectToMongo, getDatabase } from "@/components/stores/utils/mongo";
import { Collection } from "mongodb";
import { ObjectId } from "mongodb";
import { ChartDocument } from "@/lib/types/stores/chart";

// Define the Dashboard type
export interface Dashboard {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  charts: string[];
  layout: LayoutItem[];
  createdAt: Date;
  updatedAt: Date;
  permissions: {
    publicView: boolean;
    viewers: string[];
    editors: string[];
  };
}

export interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}

// Response type for retrieving multiple dashboards
export interface DashboardsResponse {
  dashboards: Dashboard[];
  count: number;
  error?: string;
}

// Helper function to get the dashboards collection
function getDashboardsCollection(): Collection<Dashboard> {
  return getDatabase().collection<Dashboard>("dashboards");
}

function getChartsCollection(): Collection<ChartDocument> {
  return getDatabase().collection<ChartDocument>("charts");
}

/**
 * Load all dashboards associated with a user
 *
 * @param userId - The ID of the user
 * @param options - Optional parameters for pagination and sorting
 * @returns A promise that resolves to an array of dashboards
 */
export async function loadUserDashboards(
  userId: string,
  options: {
    limit?: number;
    skip?: number;
    sort?: { [key: string]: 1 | -1 };
  } = {}
): Promise<Dashboard[]> {
  try {
    await connectToMongo();
    const collection = getDashboardsCollection();

    // Set default options for pagination and sorting
    const skip = options.skip || 0;
    const sort = options.sort || { updatedAt: -1 }; // Default to most recently updated
    const limit = options.limit || 0; // 0 means no limit

    // Query dashboards for the user
    const dashboards = await collection
      .find({ userId })
      .sort(sort)
      .skip(skip)
      .toArray();

    console.log(dashboards);
    // Convert MongoDB documents to plain objects with string IDs and dates to ISO strings
    return dashboards.map((dashboard) => ({
      ...dashboard,
      _id: dashboard._id,
      createdAt: dashboard.createdAt,
      updatedAt: dashboard.updatedAt,
    }));
  } catch (error) {
    console.error("Failed to load dashboards:", error);
    return [];
  }
}

/**
 * Load a specific dashboard by ID
 *
 * @param id - The ID of the dashboard
 * @param userId - The ID of the user
 * @returns A promise that resolves to the dashboard or null if not found
 */
export async function loadDashboard(id: string): Promise<Dashboard | null> {
  try {
    await connectToMongo();
    const collection = getDashboardsCollection();
    const dashboard = await collection.findOne({ _id: id });
    return dashboard;
  } catch (error) {
    console.error("Failed to load dashboard:", error);
    throw new Error("Failed to load dashboard");
  }
}

/**
 * Create a new dashboard with proper default chart layout
 */
export async function createDashboard(
  dashboard: Omit<Dashboard, "_id" | "createdAt" | "updatedAt">
): Promise<Dashboard> {
  try {
    await connectToMongo();
    const collection = getDashboardsCollection();

    // Generate default layouts for any charts that don't have layout specified
    const existingLayoutIds = new Set(
      dashboard.layout?.map((item) => item.i) || []
    );
    const chartsWithoutLayout = dashboard.charts.filter(
      (chartId) => !existingLayoutIds.has(chartId)
    );

    // Create layout for charts without layout items
    const newLayouts = chartsWithoutLayout.map((chartId, index) => {
      const row = Math.floor(index / 2); // Position in a 2-column grid
      const col = index % 2;
      return {
        i: chartId,
        x: col * 6, // 6 units wide in a 2-column layout
        y: row * 9, // 9 units high
        w: 6, // Half of the 12-unit grid
        h: 9, // Default height
        minW: 3,
        minH: 3,
      };
    });

    // Combine existing and new layouts
    const finalLayout = [...(dashboard.layout || []), ...newLayouts];

    const now = new Date();
    const newDashboard: Dashboard = {
      _id: new ObjectId().toString(),
      ...dashboard,
      layout: finalLayout,
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(newDashboard);
    return newDashboard;
  } catch (error) {
    console.error("Failed to create dashboard:", error);
    throw new Error("Failed to create dashboard");
  }
}

/**
 * Update an existing dashboard with partial data
 *
 * @param id - The dashboard ID
 * @param userId - The user ID
 * @param updates - The updates to apply to the dashboard
 * @returns A promise that resolves to the updated dashboard or null
 */
export async function updateDashboard(
  id: string,
  userId: string,
  updates: Partial<
    Omit<Dashboard, "_id" | "userId" | "createdAt" | "updatedAt">
  >
): Promise<Dashboard | null> {
  try {
    await connectToMongo();
    const collection = getDashboardsCollection();

    const updateData = {
      ...updates,
      updatedAt: new Date(),
    };

    const result = await collection.findOneAndUpdate(
      { _id: id, userId },
      { $set: updateData },
      { returnDocument: "after" }
    );

    return result;
  } catch (error) {
    console.error("Failed to update dashboard:", error);
    throw new Error("Failed to update dashboard");
  }
}

/**
 * Delete a dashboard
 *
 * @param id - The ID of the dashboard to delete
 * @param userId - The ID of the user
 * @returns A promise that resolves to true if the dashboard was deleted
 */
export async function deleteDashboard(
  id: string,
  userId: string
): Promise<boolean> {
  try {
    await connectToMongo();
    const collection = getDashboardsCollection();

    const result = await collection.deleteOne({ _id: id, userId });
    return result.deletedCount === 1;
  } catch (error) {
    console.error("Failed to delete dashboard:", error);
    throw new Error("Failed to delete dashboard");
  }
}

export async function loadUserCharts(
  userId: string,
  options: {
    limit?: number;
    skip?: number;
    sort?: { [key: string]: 1 | -1 };
  } = {}
): Promise<ChartDocument[]> {
  try {
    await connectToMongo();
    const collection = getChartsCollection();

    const sort = options.sort || { updatedAt: -1 }; // Default to most recently updated

    // Query dashboards for the user
    const charts = await collection.find({ userId }).sort(sort).toArray();
    return charts.map((chart) => ({
      ...chart,
      id: chart._id.toString(),
      createdAt: chart.createdAt,
      updatedAt: chart.updatedAt,
    }));
  } catch (error) {
    console.error("Failed to load dashboard:", error);
    throw new Error("Failed to load dashboard");
  }
}

/**
 * Create a new chart
 *
 * @param chart - The chart data to create
 * @returns A promise that resolves to the created chart
 */
export async function createChart(
  chart: Omit<ChartDocument, "_id" | "createdAt" | "updatedAt">
): Promise<ChartDocument> {
  try {
    await connectToMongo();
    const collection = getChartsCollection();

    const now = new Date();
    const newChart: ChartDocument = {
      _id: new ObjectId().toString(),
      ...chart,
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(newChart);
    return newChart;
  } catch (error) {
    console.error("Failed to create chart:", error);
    throw new Error("Failed to create chart");
  }
}
