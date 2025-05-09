"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useToast } from "@/lib/hooks/use-toast";

interface SaveChartAsPngProps {
  title: string;
  disabled?: boolean;
}

export function SaveChartAsPng({ title, disabled }: SaveChartAsPngProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    try {
      setIsExporting(true);

      // Find the chart container element
      const chartContainer = document.querySelector(".chart-preview-container");
      if (!chartContainer) {
        throw new Error("Chart container not found");
      }

      // Find the canvas element within the chart container
      const canvasElement = chartContainer.querySelector("canvas");
      if (!canvasElement) {
        throw new Error(
          "Chart canvas not found. The chart might not be ready or this chart type doesn't support PNG export."
        );
      }

      // Try different ways to get the chart instance
      // Method 1: Chart.js standard way
      // @ts-expect-error - Chart.js attaches the chart instance to the canvas
      let chartInstance = canvasElement.__chartjs__?.chart;

      // Method 2: Alternative property sometimes used
      // @ts-expect-error - Accessing non-standard _chart property
      if (!chartInstance && canvasElement._chart) {
        // @ts-expect-error - Using non-standard _chart property
        chartInstance = canvasElement._chart;
      }

      // Method 3: If no Chart.js instance, use canvas directly
      if (!chartInstance) {
        // Direct canvas export
        const dataURL = canvasElement.toDataURL("image/png", 1.0);

        // Create download link
        const link = document.createElement("a");
        link.download = `${title || "chart"}-${new Date()
          .toISOString()
          .slice(0, 10)}.png`;
        link.href = dataURL;
        link.click();

        toast({
          title: "Chart exported",
          description: "The chart has been saved as a PNG image",
        });
        return;
      }

      // Use Chart.js toBase64Image method if we have a chart instance
      const dataURL = chartInstance.toBase64Image("image/png", 1.0);

      // Create download link
      const link = document.createElement("a");
      link.download = `${title || "chart"}-${new Date()
        .toISOString()
        .slice(0, 10)}.png`;
      link.href = dataURL;
      link.click();

      toast({
        title: "Chart exported",
        description: "The chart has been saved as a PNG image",
      });
    } catch (error) {
      console.error("Export error:", error);

      toast({
        title: "Export failed",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      size="sm"
      variant="outline"
      className="gap-2"
      onClick={handleExport}
      disabled={disabled || isExporting}
      title="Export chart as PNG"
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      PNG
    </Button>
  );
}
