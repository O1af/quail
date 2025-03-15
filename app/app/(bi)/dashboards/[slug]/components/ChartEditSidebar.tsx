import React, { useState } from "react";
import { ChartDocument } from "@/lib/types/stores/chart";
import { Button } from "@/components/ui/button";
import { X, Settings2, Layers, PenLine, Eye } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ChartEditSidebarProps {
  chartData: ChartDocument | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ChartEditSidebar({
  chartData,
  isOpen,
  onClose,
}: ChartEditSidebarProps) {
  const [activeTab, setActiveTab] = useState<string>("general");

  if (!chartData) {
    return null;
  }

  return (
    <div
      className={cn(
        "h-full w-full bg-background border-l border-border z-40 shadow-lg"
      )}
      onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing sidebar
    >
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-semibold truncate flex-1">
          {chartData.title || "Untitled Chart"}
        </h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="general">
            <Settings2 className="h-4 w-4 mr-1" /> General
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Eye className="h-4 w-4 mr-1" /> Appearance
          </TabsTrigger>
          <TabsTrigger value="data">
            <Layers className="h-4 w-4 mr-1" /> Data
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[calc(100vh-120px)]">
          <TabsContent value="general" className="p-4">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Chart Title</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  {chartData.title}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-1">Description</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  {chartData.description || "No description provided"}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-1">Chart Type</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  {chartData.chartType || "Auto-detected"}
                </p>
              </div>

              <Button className="w-full" size="sm">
                <PenLine className="h-4 w-4 mr-2" /> Edit Properties
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="p-4">
            <div className="text-sm text-muted-foreground">
              <h4 className="text-sm font-medium mb-3">Appearance Settings</h4>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-4">
                    Customize the visual appearance of your chart
                  </p>

                  <Button className="w-full" size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-2" /> Customize Appearance
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="data" className="p-4">
            <div className="text-sm text-muted-foreground">
              <h4 className="text-sm font-medium mb-3">Data Preview</h4>
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
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
