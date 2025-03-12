"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Keyboard } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/lib/hooks/use-toast";
import useChartEditorStore from "@/components/stores/chartEditor_store";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

// Import modularized editor components
import {
  ChartPreviewPane,
  ChartCodeEditor,
  DataAndQueryViewer,
  NaturalLanguageInput,
} from "./Editor";

interface ChartEditorProps {
  chartId: string;
  onSaveHandlerReady: (handler: () => Promise<void>) => void;
}

export default function ChartEditor({
  chartId,
  onSaveHandlerReady,
}: ChartEditorProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const {
    chartData,
    jsxCode,
    naturalLanguagePrompt,
    isProcessingPrompt,
    error,
    isLoading,
    showUnsavedDialog,
    setJsxCode,
    setNaturalLanguagePrompt,
    setShowUnsavedDialog,
    loadChartData,
    saveChanges,
    processNaturalLanguagePrompt,
    resetEditor,
    clearError,
  } = useChartEditorStore();

  // Load chart data once on mount and cleanup on unmount
  useEffect(() => {
    loadChartData(chartId);

    return () => {
      setShowUnsavedDialog(false);
    };
  }, [chartId, loadChartData, setShowUnsavedDialog]);

  // Register save handler with parent component
  useEffect(() => {
    onSaveHandlerReady(saveChanges);
  }, [onSaveHandlerReady, saveChanges]);

  // Show toast for errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
      clearError();
    }
  }, [error, toast, clearError]);

  // Handle prompt submission with error handling via toast
  const handlePromptSubmit = useCallback(async () => {
    try {
      await processNaturalLanguagePrompt();
    } catch (err) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to process prompt",
        variant: "destructive",
      });
    }
  }, [processNaturalLanguagePrompt, toast]);

  // Handler for panel resizing
  const handleResize = useCallback(() => {
    // Force window resize event after panel resize to update chart sizes
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 100);
  }, []);

  // Handler for tab change
  const handleTabChange = useCallback(() => {
    setTimeout(() => window.dispatchEvent(new Event("resize")), 100);
  }, []);

  if (isLoading) {
    return (
      <div className="w-full animate-fade-in">
        <div className="h-12 bg-muted/30 animate-pulse mb-4"></div>
        <div className="h-[calc(100vh-180px)] bg-muted/30 animate-pulse"></div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex flex-col w-full h-full max-w-full overflow-hidden relative"
    >
      {/* Main resizable panels */}
      <div className="flex-1">
        <ResizablePanelGroup
          direction="horizontal"
          className="h-full w-full"
          onLayout={handleResize}
        >
          <ResizablePanel
            defaultSize={50}
            minSize={30}
            className="overflow-hidden w-0"
          >
            <ChartPreviewPane
              jsxCode={jsxCode}
              data={chartData?.data || null}
            />
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel
            defaultSize={50}
            minSize={30}
            className="overflow-hidden w-0"
          >
            <Tabs
              defaultValue="code"
              className="h-full flex flex-col"
              onValueChange={handleTabChange}
            >
              <div className="border-b px-4 flex-shrink-0">
                <div className="flex items-center justify-between flex-wrap">
                  <TabsList className="mt-2 mb-2 justify-start">
                    <TabsTrigger value="code">JSX Code</TabsTrigger>
                    <TabsTrigger value="query">SQL Query</TabsTrigger>
                    <TabsTrigger value="data">Data Table</TabsTrigger>
                  </TabsList>

                  <div className="py-2 text-xs text-muted-foreground flex items-center gap-2">
                    <div className="flex items-center">
                      <Keyboard className="h-3 w-3 mr-1" />
                      <span className="font-mono">
                        {navigator.platform.includes("Mac") ? "⌘+S" : "Ctrl+S"}
                      </span>
                    </div>
                    <span>to save changes</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 min-h-0 overflow-hidden">
                <TabsContent
                  value="code"
                  className="h-full overflow-hidden m-0 data-[state=active]:flex data-[state=active]:flex-col"
                >
                  <ChartCodeEditor
                    jsxCode={jsxCode}
                    onChange={setJsxCode}
                    showStatus={false}
                  />
                </TabsContent>

                <TabsContent
                  value="query"
                  className="h-full overflow-hidden m-0 data-[state=active]:flex data-[state=active]:flex-col"
                >
                  <DataAndQueryViewer type="query" query={chartData?.query} />
                </TabsContent>

                <TabsContent
                  value="data"
                  className="h-full overflow-hidden m-0 data-[state=active]:flex data-[state=active]:flex-col"
                >
                  <DataAndQueryViewer type="data" data={chartData?.data} />
                </TabsContent>
              </div>
            </Tabs>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-2/3 max-w-3xl">
        <div className="bg-background border rounded-full shadow-lg">
          <NaturalLanguageInput
            prompt={naturalLanguagePrompt}
            setPrompt={setNaturalLanguagePrompt}
            isProcessing={isProcessingPrompt}
            onSubmit={handlePromptSubmit}
          />
        </div>
      </div>
    </div>
  );
}
