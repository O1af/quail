"use server";

import { connectToMongo, getDatabase } from "@/components/stores/utils/mongo";
import { Collection } from "mongodb";
import { ObjectId } from "mongodb";

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
}

// Chart and LayoutItem interfaces
export interface Chart {
  _id: string;
  type: "bar" | "line" | "pie" | "area" | "scatter";
  title: string;
  query: string;
  visualization: any;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
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

function getChartsCollection(): Collection<Chart> {
  return getDatabase().collection<Chart>("charts");
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
export async function loadDashboard(
  id: string,
  userId: string
): Promise<Dashboard | null> {
  try {
    await connectToMongo();
    const collection = getDashboardsCollection();
    const dashboard = await collection.findOne({ _id: id, userId });
    return dashboard;
  } catch (error) {
    console.error("Failed to load dashboard:", error);
    throw new Error("Failed to load dashboard");
  }
}

/**
 * Create a new dashboard
 *
 * @param dashboard - The dashboard data to create
 * @returns A promise that resolves to the created dashboard
 */
export async function createDashboard(
  dashboard: Omit<Dashboard, "_id" | "createdAt" | "updatedAt">
): Promise<Dashboard> {
  try {
    await connectToMongo();
    const collection = getDashboardsCollection();

    const now = new Date();
    const newDashboard: Dashboard = {
      _id: new ObjectId().toString(),
      ...dashboard,
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
 * Update an existing dashboard
 *
 * @param id - The ID of the dashboard to update
 * @param userId - The ID of the user
 * @param updates - The updates to apply to the dashboard
 * @returns A promise that resolves to the updated dashboard
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

    const result = await collection.findOneAndUpdate(
      { _id: id, userId },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      },
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
): Promise<Chart[]> {
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

//function to update layout
// /**
//  * Update the layout of a dashboard
//  *
//  * @param id - The ID of the dashboard
//  * @param userId - The ID of the user
//  * @param layout - The new layout to set
//  * @returns A promise that resolves to the updated dashboard
//  */
export async function updateDashboardLayout(
  id: string,
  userId: string,
  layout: LayoutItem[]
): Promise<Dashboard | null> {
  try {
    await connectToMongo();
    const collection = getDashboardsCollection();

    const result = await collection.findOneAndUpdate(
      { _id: id, userId },
      {
        $set: {
          layout,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    return result;
  } catch (error) {
    console.error("Failed to update dashboard:", error);
    throw new Error("Failed to update dashboard");
  }
}
