import { PostgresResponse } from "@/lib/types/DBQueryTypes";
import DynamicChartRenderer from "../../AgentResult/DynamicChartRenderer";
import { AlertTriangle, BarChart3, Info } from "lucide-react"; // Added Info icon
import { useEffect, useRef, memo, useMemo, useState, useCallback } from "react";
import useChartEditorStore from "@/components/stores/chartEditor_store";
// Removed useChartData import, data comes via props
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ChartPreviewPaneProps {
  data: PostgresResponse | null; // Receive data as prop
  className?: string;
}

// Memoized Chart Renderer (Keep as is, it's good for performance)
const MemoizedChart = memo(
  ({
    jsxString,
    data,
    className,
    onError,
  }: {
    jsxString: string;
    data: PostgresResponse;
    className: string;
    onError?: (error: string | null) => void; // Allow clearing error
  }) => {
    const chartKey = useMemo(() => {
      if (!data) return "no-data";
      // Simple key based on jsx length and data presence/structure
      const jsxHash = jsxString.length.toString(36);
      const dataHash = (
        data.rows.length + Object.keys(data.rows[0] || {}).length
      ).toString(36);
      return `chart-${jsxHash}-${dataHash}`;
    }, [jsxString, data]);

    // Clear error when JSX changes before attempting render
    useEffect(() => {
      onError?.(null);
    }, [jsxString, onError]);

    return (
      <DynamicChartRenderer
        jsxString={jsxString}
        data={data}
        className={className}
        key={chartKey} // Key forces remount on significant changes
        onError={onError} // Pass error handler down
      />
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function (Keep as is)
    if (prevProps.jsxString !== nextProps.jsxString) return false;
    if (!prevProps.data || !nextProps.data)
      return prevProps.data === nextProps.data;
    if (prevProps.data.rows.length !== nextProps.data.rows.length) return false;
    const prevCols = Object.keys(prevProps.data.rows[0] || {})
      .sort()
      .join();
    const nextCols = Object.keys(nextProps.data.rows[0] || {})
      .sort()
      .join();
    return prevCols === nextCols && prevProps.className === nextProps.className;
  }
);
MemoizedChart.displayName = "MemoizedChart";

// Fallback component when no data available
const NoDataFallback = () => (
  <div className="text-muted-foreground flex flex-col items-center justify-center h-full w-full p-4 text-center">
    <BarChart3 className="h-12 w-12 mb-3 opacity-30" />
    <p className="font-medium">No Data Available</p>
    <p className="text-sm">
      Connect to a data source and run a query, or check the 'Data' tab.
    </p>
  </div>
);

export default function ChartPreviewPane({
  data,
  className,
}: ChartPreviewPaneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Get UI state from Zustand
  const { isStreaming, newJsx, showDiffView, currJsx } = useChartEditorStore();
  // Local state for rendering errors
  const [renderError, setRenderError] = useState<string | null>(null);

  // Keep track of the last stable JSX code that rendered successfully
  const lastStableJsxRef = useRef<string>(currJsx);

  // Add resize observer (Keep as is)
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver(() => {
      window.dispatchEvent(new Event("resize"));
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Update last stable JSX when current JSX changes and no error occurs
  useEffect(() => {
    if (!renderError) {
      lastStableJsxRef.current = currJsx;
    }
  }, [currJsx, renderError]);

  // Determine which JSX to display based on current state
  const displayJsx = useMemo(() => {
    // During streaming, always attempt to render the last known good JSX
    if (isStreaming) {
      return lastStableJsxRef.current;
    }
    // After streaming, in diff view, show the proposed newJsx
    if (showDiffView && newJsx !== null) {
      return newJsx;
    }
    // Otherwise (normal editing or diff view rejected/accepted), show current JSX
    return currJsx;
  }, [currJsx, isStreaming, showDiffView, newJsx]);

  // State description for the header
  const getStatusDescription = () => {
    if (isStreaming) return "Applying requested changes...";
    if (showDiffView && newJsx !== null) return "Previewing proposed changes";
    if (renderError) return "Error rendering chart";
    if (!data) return "Waiting for data...";
    return "Live visualization";
  };

  // Handle chart rendering errors
  const handleChartError = useCallback(
    (errorMessage: string | null) => {
      // Only set the error if we are not currently streaming
      // (errors during streaming are ignored as we show the stable version)
      if (!isStreaming) {
        setRenderError(errorMessage);
      } else {
        // If streaming, ensure error is cleared
        setRenderError(null);
      }
    },
    [isStreaming]
  ); // Depend only on isStreaming

  // Clear error when the JSX to be displayed changes,
  // giving the new code a chance to render.
  useEffect(() => {
    setRenderError(null);
  }, [displayJsx]);

  const hasRenderError = renderError && !isStreaming;

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-muted/20">
      {/* Header */}
      <div className="border-b p-3 flex items-center justify-between shrink-0 bg-background">
        <div className="flex items-center min-w-0">
          <BarChart3 className="h-5 w-5 mr-2 text-primary shrink-0" />
          <div className="min-w-0 overflow-hidden">
            <h2 className="text-base font-medium leading-tight truncate">
              Chart Preview
              {showDiffView && newJsx !== null && !isStreaming
                ? " (Proposed Changes)"
                : ""}
            </h2>
            <p className="text-xs text-muted-foreground truncate">
              {getStatusDescription()}
            </p>
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div
        ref={containerRef}
        className="flex-1 min-h-0 overflow-auto p-4 flex items-center justify-center relative" // Added relative positioning
      >
        {/* Overlay during streaming */}
        {isStreaming && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex flex-col items-center justify-center z-10 text-muted-foreground">
            <Info className="h-6 w-6 mb-2" />
            <span>Generating new visualization...</span>
            <span className="text-xs">(Showing last stable version)</span>
          </div>
        )}

        {/* Content */}
        <div className="w-full h-full max-w-full max-h-full chart-preview-container">
          {hasRenderError ? (
            <Alert variant="destructive" className="overflow-auto max-h-full">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Chart Rendering Error</AlertTitle>
              <AlertDescription className="mt-2">
                <p className="mb-2 text-sm">The code produced an error:</p>
                <pre className="p-2 bg-destructive/10 rounded text-xs overflow-auto whitespace-pre-wrap font-mono">
                  {renderError}
                </pre>
              </AlertDescription>
            </Alert>
          ) : data ? (
            <MemoizedChart
              jsxString={displayJsx} // Use the determined JSX
              data={data}
              className={className || "w-full h-full"}
              onError={handleChartError} // Pass the error handler
            />
          ) : (
            <NoDataFallback />
          )}
        </div>
      </div>
    </div>
  );
}
