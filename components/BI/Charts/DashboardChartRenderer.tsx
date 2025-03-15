import { PostgresResponse } from "@/lib/types/DBQueryTypes";
import DynamicChartRenderer from "../AgentResult/DynamicChartRenderer";
import { BarChart3, HelpCircle } from "lucide-react";
import { useEffect, useRef, memo, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DashboardChartRendererProps {
  jsxCode: string;
  data: PostgresResponse | null;
  title: string;
  description?: string;
  className?: string;
  compact?: boolean;
  isEditing?: boolean;
}

// Create memoized DynamicChart component to prevent rerenders
const MemoizedChart = memo(
  ({
    jsxString,
    data,
    className,
  }: {
    jsxString: string;
    data: PostgresResponse;
    className: string;
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
        showSkeleton={false}
        disableAnimations={true}
        optimizeForDashboard={true}
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
    <BarChart3 className="h-8 w-8 mb-2 opacity-40" />
    <p className="text-sm">No chart data</p>
  </div>
);

export default function DashboardChartRenderer({
  jsxCode,
  data,
  title,
  description,
  className,
  compact = false,
  isEditing = false,
}: DashboardChartRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

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

  return (
    <div
      className={cn(
        "flex flex-col h-full w-full overflow-hidden",
        isEditing &&
          "border-2 border-dashed border-primary/30 rounded-md shadow-sm border-blue-400",
        className
      )}
    >
      {!compact && (
        <div
          className={cn(
            "border-border/40 px-2 py-1.5 flex items-center shrink-0 relative",
            isEditing && "bg-primary/10 rounded-t-sm drag-handle cursor-move"
          )}
        >
          <div className="w-full text-center">
            <h3 className="text-sm font-medium leading-tight truncate mx-auto my-1">
              <span className="font-bold text-sm text-foreground/90 truncate">
                {title}
              </span>
            </h3>
          </div>

          {description && (
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground ml-1 flex-shrink-0 absolute right-2 top-1/2 transform -translate-y-1/2" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">{description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )}

      <div
        ref={containerRef}
        className="flex-1 min-h-0 overflow-hidden flex items-center justify-center p-2"
      >
        <div className="w-full h-full max-w-full max-h-full">
          {data ? (
            <MemoizedChart
              jsxString={jsxCode}
              data={data}
              className="w-full h-full"
            />
          ) : (
            <NoDataFallback />
          )}
        </div>
      </div>
    </div>
  );
}
