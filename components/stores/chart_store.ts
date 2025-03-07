"use server";
import { ObjectId } from "mongodb";
import { connectToMongo, getDatabase } from "./utils/mongo";
import { ChartDocument, ChartData } from "@/lib/types/stores/chart";

const getCollection = () => getDatabase().collection<ChartDocument>("charts");

export async function loadChart(
  chart_id: string,
  userId: string
): Promise<ChartDocument | null> {
  try {
    await connectToMongo();
    const collection = getCollection();
    const chart = await collection.findOne({ _id: chart_id, userId });
    if (!chart) {
      // error no chart found
      throw new Error("Chart not found");
    }
    return chart;
  } catch (error) {
    console.error("Failed to load chart:", error);
    throw new Error("Failed to load chart");
  }
}

export async function saveChart(
  chartData: ChartData,
  userId: string,
  title: string = "New Chart",
  chart_id: string
): Promise<void> {
  try {
    await connectToMongo();
    const collection = getCollection();

    await collection.updateOne(
      { _id: chart_id, userId },
      {
        $set: {
          data: chartData,
          updatedAt: new Date(),
          title: title,
        },
        $setOnInsert: {
          createdAt: new Date(),
          userId,
        },
      },
      { upsert: true }
    );
  } catch (error) {
    console.error("Failed to save chart:", error);
    throw new Error("Failed to save chart");
  }
}

export async function listCharts(
  userId: string
): Promise<Array<{ _id: string; title: string; updatedAt: Date }>> {
  try {
    await connectToMongo();
    return await getCollection()
      .find({ userId }, { projection: { title: 1, updatedAt: 1, _id: 1 } })
      .sort({ updatedAt: -1 })
      .toArray();
  } catch (error) {
    console.error("Failed to list charts:", error);
    throw new Error("Failed to list charts");
  }
}

export async function deleteChart(id: string, userId: string): Promise<void> {
  try {
    await connectToMongo();
    const collection = getCollection();
    const result = await collection.deleteOne({ _id: id, userId });
    if (result.deletedCount === 0) {
      throw new Error("Chart not found or unauthorized");
    }
  } catch (error) {
    console.error("Failed to delete chart:", error);
    throw new Error("Failed to delete chart");
  }
}

export async function renameChart(
  id: string,
  userId: string,
  newTitle: string
): Promise<void> {
  try {
    await connectToMongo();
    const collection = getCollection();
    const result = await collection.updateOne(
      { _id: id, userId },
      {
        $set: {
          title: newTitle,
          updatedAt: new Date(),
        },
      }
    );
    if (result.matchedCount === 0) {
      throw new Error("Chart not found or unauthorized");
    }
  } catch (error) {
    console.error("Failed to rename chart:", error);
    throw new Error("Failed to rename chart");
  }
}

export async function generateChartId(): Promise<string> {
  return new ObjectId().toString();
}
