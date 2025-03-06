"use client";

import { DynamicChartRenderer } from "./DynamicChartRenderer";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  Database,
  Code,
  Save,
  Edit,
  ArrowDownUp,
} from "lucide-react";
import { PostgresResponse } from "@/lib/types/DBQueryTypes";
import { DataVisTable } from "./DataVisTable";
import { DataVisQuery } from "./DataVisQuery";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";

interface DataVisAgentResultProps {
  chartJsx?: string;
  data?: PostgresResponse;
  query?: string;
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-full text-muted-foreground">
      {message}
    </div>
  );
}

export function DataVisAgentResult({
  chartJsx,
  data,
  query,
}: DataVisAgentResultProps) {
  const [activeTab, setActiveTab] = useState("chart");
  const router = useRouter();

  if (!chartJsx && !data && !query) return null;
  const postgresData = data as PostgresResponse;

  // Detect chart type to set appropriate height
  const chartHeight = useMemo(() => {
    if (!chartJsx) return "h-[400px]";

    // Check for circular charts that need more height
    const isCircularChart =
      chartJsx.includes("<Pie") ||
      chartJsx.includes("<Doughnut") ||
      chartJsx.includes("<PolarArea");

    return isCircularChart ? "h-[500px]" : "h-[400px]";
  }, [chartJsx]);

  const handleSave = () => {
    console.log("Saving chart");
    // Implementation for saving chart
  };

  const handleSaveAndEdit = () => {
    console.log("Save and redirecting to edit page");
    // Implementation for redirecting to edit page
    // router.push('/path/to/edit-page');
  };

  const handleDrill = () => {
    console.log("Drilling down/up");
    // Implementation for drill down/up functionality
  };

  return (
    <div className="w-full flex justify-center">
      <Card className="w-full max-w-full md:max-w-[1000px] min-w-0 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full border-b rounded-none grid grid-cols-3">
            <TabsTrigger value="chart" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="truncate">Chart</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="gap-2">
              <Database className="h-4 w-4" />
              <span className="truncate">Data</span>
            </TabsTrigger>
            <TabsTrigger value="query" className="gap-2">
              <Code className="h-4 w-4" />
              <span className="truncate">Query</span>
            </TabsTrigger>
          </TabsList>

          <div className={`relative ${chartHeight}`}>
            {/* Chart Tab */}
            <TabsContent
              value="chart"
              className="absolute inset-0 data-[state=inactive]:hidden p-6"
            >
              {chartJsx ? (
                <DynamicChartRenderer
                  jsxString={chartJsx}
                  data={postgresData}
                  className="w-full h-full"
                />
              ) : (
                <EmptyState message="No visualization available" />
              )}
            </TabsContent>

            {/* Data Tab */}
            <TabsContent
              value="data"
              className="absolute inset-0 data-[state=inactive]:hidden p-6"
            >
              <DataVisTable data={data} />
            </TabsContent>

            {/* Query Tab */}
            <TabsContent
              value="query"
              className="absolute inset-0 data-[state=inactive]:hidden p-6"
            >
              <DataVisQuery query={query} />
            </TabsContent>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap justify-between items-center p-4 border-t gap-2">
            <Button variant="outline" className="gap-2" onClick={handleDrill}>
              <ArrowDownUp className="h-4 w-4" />
              <span className="hidden sm:inline">Drill Down/Up</span>
              <span className="sm:hidden">Drill</span>
            </Button>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="gap-2" onClick={handleSave}>
                <Save className="h-4 w-4" />
                <span className="hidden sm:inline">Save Chart</span>
                <span className="sm:hidden">Save</span>
              </Button>

              <Button
                variant="default"
                className="gap-2"
                onClick={handleSaveAndEdit}
              >
                <Edit className="h-4 w-4" />
                <span className="hidden sm:inline">Save & Edit</span>
                <span className="sm:hidden">Edit</span>
              </Button>
            </div>
          </div>
        </Tabs>
      </Card>
    </div>
  );
}
