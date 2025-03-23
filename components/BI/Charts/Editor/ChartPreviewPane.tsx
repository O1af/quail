import { PostgresResponse } from "@/lib/types/DBQueryTypes";
import DynamicChartRenderer from "../../AgentResult/DynamicChartRenderer";
import { AlertTriangle, BarChart3 } from "lucide-react";
import { useEffect, useRef, memo, useMemo, useState, useCallback } from "react";
import useChartEditorStore from "@/components/stores/chartEditor_store";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ChartPreviewPaneProps {
  data: PostgresResponse | null;
  className?: string;
}

// Create memoized DynamicChart component to prevent rerenders
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
    onError?: (error: string) => void;
  }) => {
    // Create a stable key that only changes when jsxCode or data structure changes
    const chartKey = useMemo(() => {
      if (!data) return "no-data";
      const jsxHash = jsxString.length.toString(36);
      const dataHash = (
        data.rows.length + Object.keys(data.rows[0] || {}).length
      ).toString(36);
      return `chart-${jsxHash}-${dataHash}`;
    }, [jsxString, data]);

    return (
      <DynamicChartRenderer
        jsxString={jsxString}
        data={data}
        className={className}
        key={chartKey}
        onError={onError}
      />
    );
  },
  (prevProps, nextProps) => {
    // Only re-render if the JSX code has actually changed
    if (prevProps.jsxString !== nextProps.jsxString) return false;

    // Only re-render if data structure has changed
    if (!prevProps.data || !nextProps.data)
      return prevProps.data === nextProps.data;

    // Check if data structure has changed meaningfully
    if (prevProps.data.rows.length !== nextProps.data.rows.length) return false;

    // Compare column names
    const prevCols = Object.keys(prevProps.data.rows[0] || {})
      .sort()
      .join();
    const nextCols = Object.keys(nextProps.data.rows[0] || {})
      .sort()
      .join();

    return prevCols === nextCols;
  }
);

MemoizedChart.displayName = "MemoizedChart";

// Fallback component when no data available
const NoDataFallback = () => (
  <div className="text-muted-foreground flex flex-col items-center justify-center h-full w-full">
    <BarChart3 className="h-12 w-12 mb-2 opacity-40" />
    <p>No chart data available</p>
  </div>
);

export default function ChartPreviewPane({
  data,
  className,
}: ChartPreviewPaneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isStreaming, newJsx, showDiffView, currJsx } = useChartEditorStore();
  const [renderError, setRenderError] = useState<string | null>(null);

  // Keep track of the last stable JSX code
  const lastStableJsxRef = useRef<string>(currJsx);

  // Keep track of the last displayed error to avoid flashing
  const lastErrorRef = useRef<string | null>(null);

  // Add resize observer to handle container size changes
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      // Trigger resize event to update chart dimensions
      window.dispatchEvent(new Event("resize"));
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Update lastStableJsxRef when not streaming and code changes
  useEffect(() => {
    if (!isStreaming) {
      lastStableJsxRef.current = currJsx;
    }
  }, [currJsx, isStreaming]);

  // Clear errors when streaming starts
  useEffect(() => {
    if (isStreaming) {
      // Save the current error before clearing it
      lastErrorRef.current = renderError;
      setRenderError(null);
    } else if (!isStreaming && lastErrorRef.current) {
      // If we stopped streaming and had a previous error, restore it
      // But only if we're not in diff view mode (which would show new code)
      if (!showDiffView || !newJsx) {
        setRenderError(lastErrorRef.current);
      }
      lastErrorRef.current = null;
    }
  }, [isStreaming, renderError, showDiffView, newJsx]);

  // Determine which JSX to display based on current state
  const displayJsx = useMemo(() => {
    // During streaming, always use the stable version
    if (isStreaming) {
      return lastStableJsxRef.current;
    }

    // After streaming, in diff view, show newJsx
    if (showDiffView && newJsx) {
      return newJsx;
    }

    // Otherwise show current JSX
    return currJsx;
  }, [currJsx, isStreaming, showDiffView, newJsx]);

  // Showing modified state when viewing the new JSX in diff view mode but not streaming
  const isShowingNewJsx = !isStreaming && showDiffView && newJsx !== null;

  // Handle chart errors - only process when not streaming
  const handleChartError = useCallback(
    (errorMessage: string) => {
      if (!isStreaming) {
        setRenderError(errorMessage);
      }
    },
    [isStreaming]
  );

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <div className="border-b p-3 flex items-center justify-between shrink-0">
        <div className="flex items-center">
          <BarChart3 className="h-5 w-5 mr-2 text-primary flex-shrink-0" />
          <div className="min-w-0 overflow-hidden">
            <h2 className="text-base font-medium leading-tight truncate">
              {isStreaming ? "Generating Chart..." : "Chart Preview"}
              {isShowingNewJsx ? " (Modified)" : ""}
            </h2>
            <p className="text-xs text-muted-foreground truncate">
              {isStreaming
                ? "Applying your requested changes..."
                : isShowingNewJsx
                ? "Preview of modified visualization"
                : "Live visualization of your data"}
            </p>
          </div>
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex-1 min-h-0 overflow-auto p-4 bg-muted/10 flex items-center justify-center"
      >
        <div className="w-full h-full max-w-full max-h-full">
          {renderError && !isStreaming ? (
            <Alert variant="destructive" className="overflow-auto max-h-full">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Chart Rendering Error</AlertTitle>
              <AlertDescription className="mt-2">
                <p className="mb-2 text-sm">
                  Fix the following error in your chart code:
                </p>
                <pre className="p-2 bg-destructive/10 rounded text-xs overflow-auto whitespace-pre-wrap">
                  {renderError}
                </pre>
              </AlertDescription>
            </Alert>
          ) : data ? (
            <MemoizedChart
              jsxString={displayJsx}
              data={data}
              className={className || "w-full h-full"}
              onError={handleChartError}
            />
          ) : (
            <NoDataFallback />
          )}
        </div>
      </div>
    </div>
  );
}
