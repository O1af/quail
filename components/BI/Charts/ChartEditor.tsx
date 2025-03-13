"use client";

import { useEffect, useCallback, useRef } from "react";
import { Check, Keyboard, Loader2, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/lib/hooks/use-toast";
import useChartEditorStore from "@/components/stores/chartEditor_store";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";

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
  onSaveHandlerReady: (handler: () => Promise<void>) => void;
}

export default function ChartEditor({
  chartId,
  onSaveHandlerReady,
}: ChartEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const {
    chartData,
    error,
    isLoading,
    loadChartData,
    saveChanges,
    resetEditor,
    clearError,
    isStreaming,
    showDiffView,
    acceptChanges,
    rejectChanges,
  } = useChartEditorStore();

  // Load chart data once on mount and cleanup on unmount
  useEffect(() => {
    loadChartData(chartId);

    return () => {
      resetEditor();
    };
  }, [chartId, loadChartData, resetEditor]);

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

  // Show accept/reject buttons after streaming completes and we're in diff view
  const showAcceptRejectButtons = !isStreaming && showDiffView;

  // Determine which status element to show
  const isMac =
    typeof navigator !== "undefined"
      ? navigator.userAgent.includes("Mac")
      : false;
  const saveShortcut = isMac ? "⌘+S" : "Ctrl+S";

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
            <ChartPreviewPane data={chartData?.data || null} />
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
                    {isStreaming ? (
                      <span className="text-amber-500 flex items-center">
                        <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                        Generating changes...
                      </span>
                    ) : showAcceptRejectButtons ? (
                      <div className="flex items-center gap-2">
                        <div className="flex gap-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={rejectChanges}
                            className="flex items-center gap-1 h-6 text-xs py-0"
                          >
                            <X className="h-3 w-3" />
                            Reject
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={acceptChanges}
                            className="flex items-center gap-1 bg-green-600 hover:bg-green-700 h-6 text-xs py-0"
                          >
                            <Check className="h-3 w-3" />
                            Accept
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center">
                          <Keyboard className="h-3 w-3 mr-1" />
                          <span className="font-mono">{saveShortcut}</span>
                        </div>
                        <span>to save changes</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-1 min-h-0 overflow-hidden">
                <TabsContent
                  value="code"
                  className="h-full overflow-hidden m-0 data-[state=active]:flex data-[state=active]:flex-col"
                >
                  <EditorContainer
                    codeEditor={<ChartCodeEditor showStatus={false} />}
                    diffEditor={<ChartDiffEditor />}
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
          <NaturalLanguageInput />
        </div>
      </div>
    </div>
  );
}
