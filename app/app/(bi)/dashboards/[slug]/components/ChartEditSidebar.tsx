import React from "react";
import { ChartDocument } from "@/lib/types/stores/chart";
import { Button } from "@/components/ui/button";
import { X, PenLine, Eye, Lock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ChartEditSidebarProps {
  chartData: ChartDocument | null;
  isOpen: boolean;
  onClose: () => void;
  isChartOwner: boolean;
}

export function ChartEditSidebar({
  chartData,
  isOpen,
  onClose,
  isChartOwner,
}: ChartEditSidebarProps) {
  if (!chartData) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex flex-col h-full w-full bg-background border-l border-border z-40 shadow-lg"
      )}
      onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing sidebar
    >
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-semibold truncate flex-1">
          Chart Settings
        </h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* General Section */}
          <div className="space-y-4">
            {/* <h4 className="text-sm font-medium">Chart Settings</h4> */}
            <div>
              <h5 className="text-sm font-medium mb-1">Chart Title</h5>
              <p className="text-sm text-muted-foreground mb-2">
                {chartData.title}
              </p>
            </div>

            <div>
              <h5 className="text-sm font-medium mb-1">Description</h5>
              <p className="text-sm text-muted-foreground mb-2">
                {chartData.description || "No description provided"}
              </p>
            </div>

            {isChartOwner ? (
              <Button className="w-full" size="sm" variant="outline">
                <PenLine className="h-4 w-4 mr-2" /> Edit Properties
              </Button>
            ) : (
              <div className="text-sm text-muted-foreground p-2 bg-muted rounded-md flex items-center">
                <Lock className="h-4 w-4 mr-2" />
                You do not have the necessary permissions to edit this chart.
              </div>
            )}
          </div>

          {/* Appearance Section */}
          {isChartOwner && (
            <div className="space-y-4 pt-4 border-t">
              <h4 className="text-sm font-medium">Appearance Settings</h4>
              <p className="text-xs text-muted-foreground mb-4">
                Customize the visual appearance of your chart
              </p>
              <Link
                href={`/charts/${chartData._id}`}
                className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md"
              >
                <Eye className="h-4 w-4 mr-2" /> Customize Appearance
              </Link>
            </div>
          )}

          {/* Data Section */}
          {isChartOwner && (
            <div className="space-y-4 pt-4 border-t">
              <h4 className="text-sm font-medium">Data Preview</h4>
              {chartData.data ? (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Sample of the data used to generate this chart:
                  </p>
                  <div className="text-xs bg-muted p-2 rounded-md overflow-x-auto mt-2">
                    <pre>
                      {JSON.stringify(
                        chartData.data.data?.rows?.[0] || {},
                        null,
                        2
                      )}
                    </pre>
                  </div>
                </div>
              ) : (
                <div>No data available for this chart</div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
