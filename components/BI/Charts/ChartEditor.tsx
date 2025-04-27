"use client";

import { useEffect, useCallback, useRef } from "react";
import { Check, Loader2, X, Keyboard } from "lucide-react"; // Removed Keyboard
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/lib/hooks/use-toast";
import useChartEditorStore from "@/components/stores/chartEditor_store";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { useChartData } from "@/lib/hooks/use-chart-data"; // Use hook directly

// Import modularized editor components
import {
  ChartPreviewPane,
  ChartCodeEditor,
  ChartDiffEditor,
  DataAndQueryViewer,
  NaturalLanguageInput,
  EditorContainer,
} from "./Editor";

interface ChartEditorProps {
  chartId: string;
  // Removed onSaveHandlerReady
}

export default function ChartEditor({ chartId }: ChartEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Use React Query hook directly within the editor component
  const {
    data: chartQueryResult,
    isLoading, // Use loading state from hook
    error: queryError, // Use error state from hook
  } = useChartData(chartId);

  // Use Zustand store for UI state
  const {
    error: storeError, // Renamed to avoid conflict
    clearError,
    isStreaming,
    showDiffView,
    acceptChanges,
    rejectChanges,
    setError, // Keep setError for UI/render errors
    // Removed state related to saving as it's handled by the page
  } = useChartEditorStore();

  // Handle UI/render errors from the store or query errors if needed
  useEffect(() => {
    const displayError = storeError || queryError?.message;
    if (displayError) {
      // Avoid showing auth errors handled by the page
      if (
        !displayError.toLowerCase().includes("authenticated") &&
        !displayError.toLowerCase().includes("not found") // Let page handle not found
      ) {
        toast({
          title: "Editor Error",
          description: displayError,
          variant: "destructive",
        });
      }
      clearError(); // Clear store error after showing
    }
  }, [storeError, queryError, toast, clearError]);

  // Handler for panel resizing
  const handleResize = useCallback(() => {
    setTimeout(() => window.dispatchEvent(new Event("resize")), 100);
  }, []);

  // Handler for tab change
  const handleTabChange = useCallback(() => {
    setTimeout(() => window.dispatchEvent(new Event("resize")), 100);
  }, []);

  // Show loading indicator based on React Query's state
  if (isLoading && !chartQueryResult) {
    // Show a simpler loading state within the editor area
    return (
      <div className="flex items-center justify-center h-full w-full text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Loading chart components...
      </div>
    );
  }

  // Show accept/reject buttons after streaming completes and we're in diff view
  const showAcceptRejectButtons = !isStreaming && showDiffView;

  return (
    <div
      ref={containerRef}
      className="flex flex-col w-full h-full max-w-full overflow-hidden relative"
    >
      {/* Main resizable panels */}
      <div className="flex-1 min-h-0">
        {" "}
        {/* Added min-h-0 */}
        <ResizablePanelGroup
          direction="horizontal"
          className="h-full w-full"
          onLayout={handleResize}
        >
          <ResizablePanel
            defaultSize={55}
            minSize={30}
            className="overflow-hidden w-0 flex flex-col" // Added flex flex-col
          >
            <ChartPreviewPane
              data={chartQueryResult?.chartData?.data || null}
            />
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel
            defaultSize={45}
            minSize={30}
            className="overflow-hidden w-0 flex flex-col" // Added flex flex-col
          >
            <Tabs
              defaultValue="code"
              className="h-full flex flex-col" // Ensure Tabs takes full height
              onValueChange={handleTabChange}
            >
              <div className="border-b px-4 shrink-0">
                <div className="flex items-center justify-between flex-wrap">
                  <TabsList className="mt-2 mb-2 justify-start">
                    <TabsTrigger value="code">JSX Code</TabsTrigger>
                    <TabsTrigger value="query">SQL Query</TabsTrigger>
                    <TabsTrigger value="data">Data Table</TabsTrigger>
                  </TabsList>

                  {/* Status Indicator Area */}
                  <div className="py-2 text-xs text-muted-foreground flex items-center gap-2 h-8">
                    {" "}
                    {/* Fixed height */}
                    {isStreaming ? (
                      <span className="text-amber-500 flex items-center">
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Generating changes...
                      </span>
                    ) : showAcceptRejectButtons ? (
                      <div className="flex items-center gap-2">
                        <span>Review changes:</span>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={rejectChanges}
                          className="flex items-center gap-1 h-6 text-xs px-2 py-0"
                        >
                          <X className="h-3 w-3" />
                          Reject
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={acceptChanges}
                          className="flex items-center gap-1 bg-green-600 hover:bg-green-700 h-6 text-xs px-2 py-0"
                        >
                          <Check className="h-3 w-3" />
                          Accept
                        </Button>
                      </div>
                    ) : (
                      <span className="flex items-center gap-1 italic">
                        <Keyboard className="h-3 w-3" /> {/* Added icon */}
                        Press{" "}
                        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                          {/* Use kbd tag and Mac symbol */}
                          {typeof navigator !== "undefined" &&
                          /Mac|iPod|iPhone|iPad/.test(navigator.platform)
                            ? "⌘"
                            : "Ctrl"}
                        </kbd>
                        +
                        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                          S
                        </kbd>{" "}
                        to preview
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Tab Content Area */}
              <div className="flex-1 min-h-0 overflow-hidden">
                <TabsContent
                  value="code"
                  className="h-full overflow-hidden m-0 data-[state=active]:flex data-[state=active]:flex-col"
                >
                  <EditorContainer
                    // Pass showStatus={true} to show local save hint
                    codeEditor={<ChartCodeEditor showStatus={true} />}
                    diffEditor={<ChartDiffEditor />}
                  />
                </TabsContent>

                <TabsContent
                  value="query"
                  className="h-full overflow-hidden m-0 data-[state=active]:flex data-[state=active]:flex-col"
                >
                  <DataAndQueryViewer
                    type="query"
                    query={chartQueryResult?.chartData?.query}
                  />
                </TabsContent>

                <TabsContent
                  value="data"
                  className="h-full overflow-hidden m-0 data-[state=active]:flex data-[state=active]:flex-col"
                >
                  <DataAndQueryViewer
                    type="data"
                    data={chartQueryResult?.chartData?.data}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      {/* Natural Language Input - positioned absolutely */}
      {chartId && chartId !== "new" && <NaturalLanguageInput />}
    </div>
  );
}
