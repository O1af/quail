"use server";

import { connectToMongo, getDatabase } from "@/components/stores/utils/mongo";
import { Collection, ObjectId } from "mongodb";
import { Dashboard } from "@/components/stores/dashboard_store";

function getDashboardsCollection(): Collection<Dashboard> {
  return getDatabase().collection<Dashboard>("dashboards");
}

/**
 * Update a dashboard title
 *
 * @param dashboardId - The ID of the dashboard to update
 * @param userId - The user ID for security validation
 * @param newTitle - The new title to set
 * @returns A promise that resolves to the updated dashboard or null if not found
 */
export async function updateDashboardTitle(
  dashboardId: string,
  userId: string,
  newTitle: string
): Promise<Dashboard | null> {
  try {
    await connectToMongo();
    const collection = getDashboardsCollection();

    // Ensure title is not empty
    const title = newTitle.trim() || "Untitled Dashboard";

    const result = await collection.findOneAndUpdate(
      { _id: dashboardId, userId: userId },
      {
        $set: {
          title: title,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    return result;
  } catch (error) {
    console.error("Failed to update dashboard title:", error);
    throw new Error("Failed to update dashboard title");
  }
}

/**
 * Duplicate a dashboard
 *
 * @param dashboardId - The ID of the dashboard to duplicate
 * @param userId - The user ID for security validation
 * @returns A promise that resolves to the new duplicated dashboard
 */
export async function duplicateDashboard(
  dashboardId: string,
  userId: string
): Promise<Dashboard | null> {
  try {
    await connectToMongo();
    const collection = getDashboardsCollection();

    // Find the original dashboard
    const originalDashboard = await collection.findOne({
      _id: dashboardId,
      userId: userId,
    });

    if (!originalDashboard) {
      throw new Error("Dashboard not found or you don't have access");
    }

    // Create a new dashboard based on the original one
    const now = new Date();
    const newDashboard: Dashboard = {
      ...originalDashboard,
      _id: new ObjectId().toString(),
      title: `${originalDashboard.title} (Copy)`,
      createdAt: now,
      updatedAt: now,
    };

    // Insert the new dashboard
    await collection.insertOne(newDashboard);

    return newDashboard;
  } catch (error) {
    console.error("Failed to duplicate dashboard:", error);
    throw new Error("Failed to duplicate dashboard");
  }
}
