"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Plus,
  Trash2,
  BarChart3,
  LineChart,
  PieChart,
  ArrowDown,
} from "lucide-react";
import { listCharts } from "@/components/stores/chart_store";
import { ChartDocument } from "@/lib/types/stores/chart";
import { cn } from "@/lib/utils";

interface ManageChartsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  currentCharts: string[];
  onChartsChange?: (newCharts: string[], apply: boolean) => void;
}

export function ManageChartsModal({
  open,
  onOpenChange,
  userId,
  currentCharts,
  onChartsChange,
}: ManageChartsModalProps) {
  const [allCharts, setAllCharts] = useState<ChartDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentlyModified, setRecentlyModified] = useState<string[]>([]);

  // State to track current dashboard charts during editing
  const [tempDashboardCharts, setTempDashboardCharts] =
    useState<string[]>(currentCharts);

  // Reset tempDashboardCharts when currentCharts changes or modal opens
  useEffect(() => {
    setTempDashboardCharts([...currentCharts]);
  }, [currentCharts, open]);

  // Fetch all of the user's charts
  useEffect(() => {
    const loadCharts = async () => {
      if (!open) return; // Only fetch when modal is open

      try {
        setLoading(true);
        const charts = await listCharts(userId);
        setAllCharts(charts as ChartDocument[]);
        console.log("All charts:", charts);
        console.log("Current charts in dashboard:", currentCharts);
        setError(null);
      } catch (err) {
        console.error("Error loading charts:", err);
        setError("Failed to load charts");
      } finally {
        setLoading(false);
      }
    };

    if (userId && open) {
      loadCharts();
    }
  }, [userId, open]);

  // Enhanced action handlers with visual feedback
  const handleAddChart = (chartId: string) => {
    // ...existing add chart code...
    setRecentlyModified((prev) => [...prev, chartId]);
    setTempDashboardCharts((prev) => [...prev, chartId]);
    setTimeout(() => {
      setRecentlyModified((prev) => prev.filter((id) => id !== chartId));
    }, 1000);
  };

  const handleRemoveChart = (chartId: string) => {
    // ...existing remove chart code...
    setRecentlyModified((prev) => [...prev, chartId]);
    setTempDashboardCharts((prev) => prev.filter((id) => id !== chartId));
    setTimeout(() => {
      setRecentlyModified((prev) => prev.filter((id) => id !== chartId));
    }, 1000);
  };

  // Function to handle applying changes
  const handleApplyChanges = () => {
    // ...existing apply changes code...
    if (onChartsChange) {
      onChartsChange(tempDashboardCharts, true);
    }
    onOpenChange(false);
  };

  // Function to handle canceling changes
  const handleCancel = () => {
    // ...existing cancel code...
    setTempDashboardCharts([...currentCharts]);
    if (onChartsChange) {
      onChartsChange(currentCharts, false);
    }
    onOpenChange(false);
  };

  // Helper function to get chart type icon based on visualization type
  // const getChartTypeIcon = (chart: ChartDocument) => {
  //   // Try to determine chart type from data structure
  //   const chartType = (chart.data?.chartType || chart.data?.type)?.toLowerCase();

  //   switch (chartType) {
  //     case "bar":
  //       return <BarChart3 className="h-4 w-4 text-muted-foreground" />;
  //     case "line":
  //       return <LineChart className="h-4 w-4 text-muted-foreground" />;
  //     case "pie":
  //       return <PieChart className="h-4 w-4 text-muted-foreground" />;
  //     default:
  //       return <BarChart3 className="h-4 w-4 text-muted-foreground" />; // Default icon
  //   }
  // };

  // // Get chart type text for display
  // const getChartTypeText = (chart: ChartDocument) => {
  //   const chartType = chart.data?.chartType || chart.data?.type;
  //   return chartType
  //     ? chartType.charAt(0).toUpperCase() + chartType.slice(1)
  //     : "Chart";
  // };

  // Track if any changes have been made
  const hasChanges =
    JSON.stringify(tempDashboardCharts.sort()) !==
    JSON.stringify(currentCharts.sort());

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen && hasChanges) {
          // If closing with changes, confirm with user
          const confirmed = window.confirm(
            "You have unsaved chart changes. Are you sure you want to close without applying these changes?"
          );
          if (!confirmed) {
            return;
          }
          // If confirmed closing without saving, notify parent
          if (onChartsChange) {
            onChartsChange(currentCharts, false);
          }
        }
        onOpenChange(newOpen);
      }}
    >
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-xl">
        <DialogHeader>
          <DialogTitle>Manage Dashboard Charts</DialogTitle>
          <DialogDescription>
            Add or remove charts from your dashboard.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center my-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-destructive text-center my-4">{error}</div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm text-muted-foreground">
                  Current Dashboard Charts
                </h3>
                <Badge variant="outline" className="text-xs">
                  {tempDashboardCharts.length} charts
                </Badge>
              </div>

              {tempDashboardCharts.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  No charts added to this dashboard yet
                </p>
              ) : (
                <div className="space-y-2">
                  {allCharts
                    .filter((chart) => tempDashboardCharts.includes(chart._id))
                    .map((chart) => (
                      <div
                        key={chart._id}
                        className={cn(
                          "flex items-center justify-between border rounded-md p-3 transition-all duration-200",
                          "hover:border-red-200 dark:hover:border-red-800",
                          recentlyModified.includes(chart._id) &&
                            "animate-pulse bg-red-50 dark:bg-red-950/20"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          {/* {getChartTypeIcon(chart)} */}
                          <div>
                            <p className="font-medium">{chart.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {/* {getChartTypeText(chart)} */}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-950/50"
                          onClick={() => handleRemoveChart(chart._id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1.5" />
                          Remove
                        </Button>
                      </div>
                    ))}
                </div>
              )}

              <div className="h-px bg-border my-6" />

              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm text-muted-foreground">
                  Available Charts
                </h3>
                <Badge variant="outline" className="text-xs">
                  {
                    allCharts.filter(
                      (chart) => !tempDashboardCharts.includes(chart._id)
                    ).length
                  }{" "}
                  available
                </Badge>
              </div>

              {allCharts.filter(
                (chart) => !tempDashboardCharts.includes(chart._id)
              ).length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  No additional charts available
                </p>
              ) : (
                <div className="space-y-2">
                  {allCharts
                    .filter((chart) => !tempDashboardCharts.includes(chart._id))
                    .map((chart) => (
                      <div
                        key={chart._id}
                        className={cn(
                          "flex items-center justify-between border rounded-md p-3 transition-all duration-200",
                          "hover:border-green-200 dark:hover:border-green-800",
                          recentlyModified.includes(chart._id) &&
                            "animate-pulse bg-green-50 dark:bg-green-950/20"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          {/* {getChartTypeIcon(chart)} */}
                          <div>
                            <p className="font-medium">{chart.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {/* {getChartTypeText(chart)} */}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-500 dark:hover:bg-green-950/50"
                          onClick={() => handleAddChart(chart._id)}
                        >
                          <Plus className="h-4 w-4 mr-1.5" />
                          Add
                        </Button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </ScrollArea>
        )}

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          {hasChanges && (
            <div className="text-xs text-muted-foreground flex items-center">
              <ArrowDown className="h-3 w-3 mr-1 animate-bounce" />
              Charts modified
            </div>
          )}
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleApplyChanges} disabled={!hasChanges}>
              Apply Changes
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
