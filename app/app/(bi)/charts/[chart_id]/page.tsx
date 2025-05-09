"use client";

import ChartEditor from "@/components/BI/Charts/ChartEditor";
import { useHeader } from "@/components/header/header-context";
import { generateChartId } from "@/components/stores/chart_store"; // Keep for new chart ID generation
import useChartEditorStore from "@/components/stores/chartEditor_store";
import { useChartData, useSaveChart } from "@/lib/hooks/use-chart-data";
import { useIsAuthenticated } from "@/lib/hooks/use-authenticated-query";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Loader2, Pencil } from "lucide-react"; // Import Pencil
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { useToast } from "@/lib/hooks/use-toast"; // Import useToast
import { SaveChartAsPng } from "@/components/header/buttons/save-chart-png"; // Import the new component

export default function ChartPage() {
  const params = useParams<{ chart_id: string }>();
  const { setHeaderContent, setHeaderButtons } = useHeader();
  const router = useRouter();
  const { toast } = useToast(); // Initialize toast

  // --- State Management ---
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState("");

  // Zustand Store for UI State
  const {
    title,
    currJsx,
    hasUnsavedChanges,
    setTitle,
    setOriginalContent,
    setChartId,
    resetEditor,
  } = useChartEditorStore();

  // React Query for Server State
  const { isAuthenticated, isLoading: authLoading } = useIsAuthenticated();
  const {
    data: chartQueryResult, // Renamed to avoid conflict with chartData inside
    isLoading: dataLoading,
    error: queryError,
  } = useChartData(params.chart_id === "new" ? null : params.chart_id);
  const {
    mutate: saveChart,
    isPending: isSaving,
    error: saveError,
  } = useSaveChart();

  // Combined loading state
  const isLoading = authLoading || (params.chart_id !== "new" && dataLoading);

  // --- Callbacks (Moved Before useEffect) ---

  // Save changes handler
  const handleSave = useCallback(async () => {
    if (!chartQueryResult?.chartData || isSaving || !hasUnsavedChanges) return;

    saveChart(
      {
        chartId: params.chart_id,
        chartData: chartQueryResult.chartData, // Pass the base data
        currJsx: currJsx, // Pass current JSX from store
        title: title, // Pass current title from store
      },
      {
        onSuccess: () => {
          toast({
            title: "Chart Saved",
            description: `"${title}" has been saved successfully.`,
          });
          // Update original content in store after successful save
          setOriginalContent(currJsx, title);
        },
        // onError is handled by the useEffect hook
      }
    );
  }, [
    params.chart_id,
    chartQueryResult,
    currJsx,
    title,
    isSaving,
    hasUnsavedChanges,
    saveChart,
    setOriginalContent,
    toast,
  ]);

  // Title editing handlers
  const handleTitleClick = useCallback(() => {
    if (isLoading) return; // Don't allow editing while loading
    setTempTitle(title); // Initialize input with current title
    setIsEditingTitle(true);
  }, [title, isLoading]);

  const handleTitleSave = useCallback(() => {
    const newTitle = tempTitle.trim();
    if (newTitle && newTitle !== title) {
      setTitle(newTitle); // Update title in Zustand store
      // Note: This marks changes as unsaved, actual save happens via header button
    }
    setIsEditingTitle(false);
  }, [tempTitle, title, setTitle]);

  const handleTitleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleTitleSave();
      } else if (e.key === "Escape") {
        setIsEditingTitle(false);
        setTempTitle(title); // Reset temp title on escape
      }
    },
    [handleTitleSave, title] // Dependency on handleTitleSave is correct here
  );

  // --- Effects ---

  // Initialize Zustand store when data loads or chartId changes
  useEffect(() => {
    setChartId(params.chart_id); // Set chartId in store
    if (chartQueryResult) {
      setOriginalContent(
        chartQueryResult.chartData.chartJsx,
        chartQueryResult.title
      );
      setTempTitle(chartQueryResult.title); // Initialize tempTitle for editing
    }
    // Reset editor state on unmount or when chartId changes significantly
    return () => {
      // resetEditor(); // Consider if reset is needed here or handled by component unmount
    };
  }, [
    params.chart_id,
    chartQueryResult,
    setOriginalContent,
    setChartId,
    // resetEditor, // Add resetEditor if needed on chartId change
  ]);

  // Handle query and save errors
  useEffect(() => {
    const error = queryError || saveError;
    if (error) {
      console.error("Chart operation error:", error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
      // Optionally clear the error from the mutation hook if needed
    }
  }, [queryError, saveError, toast]);

  // Handle new chart creation redirect
  useEffect(() => {
    if (params.chart_id === "new") {
      const createNewChart = async () => {
        try {
          const newChartId = await generateChartId();
          router.replace(`/charts/${newChartId}`);
        } catch (error) {
          console.error("Failed to generate new chart ID:", error);
          toast({
            title: "Error",
            description: "Could not create a new chart. Please try again.",
            variant: "destructive",
          });
          router.replace("/charts"); // Redirect back if creation fails
        }
      };
      createNewChart();
    }
  }, [params.chart_id, router, toast]);

  // Update Header Content (Title)
  useEffect(() => {
    setHeaderContent(
      <div className="flex items-center gap-2 h-9 max-w-md">
        {" "}
        {/* Added max-w-md to prevent excessive width */}
        {isEditingTitle ? (
          <Input
            className="h-9 text-xl font-semibold px-2"
            style={{
              width: `${Math.max(200, tempTitle.length * 12)}px`,
              maxWidth: "400px",
            }} // Added maxWidth for input
            value={tempTitle}
            onChange={(e) => setTempTitle(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={handleTitleKeyDown}
            autoFocus
          />
        ) : isLoading ? (
          <div className="h-7 w-[200px] bg-muted/30 rounded animate-pulse"></div>
        ) : (
          <>
            <div className="truncate" title={title || "Untitled Chart"}>
              {" "}
              {/* Wrap h1, add truncate and title attribute */}
              <h1 className="text-xl font-semibold">
                {title || "Untitled Chart"}
              </h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground flex-shrink-0" // Added flex-shrink-0
              onClick={handleTitleClick}
              title="Edit title"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    );
  }, [
    isLoading,
    isEditingTitle,
    tempTitle,
    title,
    handleTitleClick,
    handleTitleSave,
    handleTitleKeyDown,
    setHeaderContent,
  ]);

  // Update Header Buttons (Back, Save, Save as PNG)
  useEffect(() => {
    setHeaderButtons(
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/charts" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Charts
          </Link>
        </Button>

        {params.chart_id !== "new" && ( // Only show save for existing charts
          <>
            <Button
              size="sm"
              className="gap-2 w-[130px]" // Fixed width to prevent layout shifts
              disabled={isSaving || !hasUnsavedChanges || isLoading}
              onClick={handleSave} // Now defined above
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSaving
                ? "Saving..."
                : hasUnsavedChanges
                ? "Save Changes"
                : "Saved"}
            </Button>

            {/* Add Save as PNG button */}
            <SaveChartAsPng title={title} disabled={isLoading || isSaving} />
          </>
        )}
      </div>
    );
  }, [
    params.chart_id,
    isSaving,
    hasUnsavedChanges,
    isLoading,
    handleSave,
    title, // Added title as dependency
    setHeaderButtons,
  ]);

  // Cleanup header on unmount
  useEffect(() => {
    return () => {
      setHeaderContent(null);
      setHeaderButtons(null);
    };
  }, [setHeaderContent, setHeaderButtons]);

  // --- Render Logic ---

  // Loading state for new chart creation/redirect
  if (params.chart_id === "new") {
    return (
      <div className="container py-12 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Creating new chart...</p>
        </div>
      </div>
    );
  }

  // Loading state for existing chart
  if (isLoading) {
    return (
      <div className="container py-12 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading chart...</p>
        </div>
      </div>
    );
  }

  // Error state (handled by toast, but could show a message here too)
  if (queryError && !chartQueryResult) {
    return (
      <div className="container py-12 text-center text-destructive">
        <p>Failed to load chart data.</p>
        <p className="text-sm">{queryError.message}</p>
      </div>
    );
  }

  // Render the editor once authenticated and data is available (or loading is finished)
  return (
    <div className="w-full max-w-[100vw] h-[calc(100vh-64px)] overflow-hidden flex flex-col">
      {/* Pass chartId and potentially the fetched data if needed */}
      {/* ChartEditor now relies on Zustand and useChartData hook internally */}
      <ChartEditor chartId={params.chart_id} />
    </div>
  );
}
