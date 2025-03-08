"use client";

import ChartEditor from "@/components/BI/Charts/ChartEditor";
import { useHeader } from "@/components/header/header-context";
import { generateChartId } from "@/components/stores/chart_store";
import useChartEditorStore from "@/components/stores/chartEditor_store";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

export default function ChartPage() {
  const params = useParams<{ chart_id: string }>();
  const { setHeaderContent, setHeaderButtons } = useHeader();
  const router = useRouter();

  // State for title editing in header
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState("");

  // Get state from the editor store
  const {
    title,
    hasUnsavedChanges,
    isSaving,
    isLoading,
    saveChanges,
    setTitle,
  } = useChartEditorStore();

  // Save changes handler
  const handleSave = useCallback(async () => {
    try {
      await saveChanges();
    } catch (error) {
      console.error("Error saving:", error);
    }
  }, [saveChanges]);

  // Title editing handlers
  const handleTitleClick = useCallback(() => {
    setTempTitle(title);
    setIsEditingTitle(true);
  }, [title]);

  const handleTitleSave = useCallback(() => {
    if (tempTitle.trim()) {
      setTitle(tempTitle);
    }
    setIsEditingTitle(false);
  }, [tempTitle, setTitle]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleTitleSave();
      } else if (e.key === "Escape") {
        setIsEditingTitle(false);
      }
    },
    [handleTitleSave]
  );

  // Handle new chart creation and header setup
  useEffect(() => {
    // Set header content with editable title
    setHeaderContent(
      <div className="flex flex-col">
        {isEditingTitle ? (
          <Input
            className="w-[240px] h-9 text-xl font-semibold"
            value={tempTitle}
            onChange={(e) => setTempTitle(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        ) : isLoading ? (
          <div className="h-9 w-[200px] bg-muted/30 rounded animate-pulse"></div>
        ) : (
          <h1
            className="text-xl font-semibold cursor-pointer hover:text-primary transition-colors"
            onClick={handleTitleClick}
          >
            {title}
          </h1>
        )}
        <p className="text-sm text-muted-foreground">
          {isLoading ? "" : "Click to edit title"}
        </p>
      </div>
    );

    // Set back button and save button in header
    setHeaderButtons(
      <div className="flex gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href="/charts" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Charts
          </Link>
        </Button>

        <Button
          size="sm"
          className="gap-2"
          disabled={isSaving || !hasUnsavedChanges || isLoading}
          onClick={handleSave}
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    );

    // Handle new chart creation
    if (params.chart_id === "new") {
      const createNewChart = async () => {
        try {
          const newChartId = await generateChartId();
          router.replace(`/charts/${newChartId}`);
        } catch (error) {
          console.error("Failed to generate new chart ID:", error);
        }
      };

      createNewChart();
    }

    return () => {
      setHeaderContent(null);
      setHeaderButtons(null);
    };
  }, [
    params.chart_id,
    router,
    setHeaderContent,
    setHeaderButtons,
    title,
    isEditingTitle,
    tempTitle,
    handleKeyDown,
    handleTitleClick,
    handleTitleSave,
    isSaving,
    hasUnsavedChanges,
    handleSave,
    isLoading,
  ]);

  // Show loading indicator for new chart creation
  if (params.chart_id === "new") {
    return (
      <div className="container py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Creating new chart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[100vw] h-[calc(100vh-64px)] overflow-hidden flex flex-col">
      <ChartEditor chartId={params.chart_id} onSaveHandlerReady={() => {}} />
    </div>
  );
}
