import React, {
  memo,
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import { Dashboard } from "@/components/stores/dashboard_store";
import { ChartItem } from "@/app/app/(bi)/dashboards/[slug]/components/ChartItem";
import { ChartEditSidebar } from "@/app/app/(bi)/dashboards/[slug]/components/ChartEditSidebar";
import { FilterDialog } from "@/app/app/(bi)/dashboards/[slug]/components/FilterBar";
import Fuse from "fuse.js";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { Expand, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Define date range type
interface DateRange {
  from: Date | undefined;
  to?: Date | undefined;
}

interface DashboardGridProps {
  dashboard: Dashboard;
  chartData: Map<string, any>;
  isEditing: boolean;
  onLayoutChange: (layout: any) => void;
  userId: string;
  onChartDataChange?: (chartId: string, updates: any) => void;
}

// Initialize the WidthProvider outside the component to avoid re-creation
const ResponsiveGridLayout = WidthProvider(Responsive);

export const DashboardGrid = memo(
  ({
    dashboard,
    chartData,
    isEditing,
    onLayoutChange,
    userId,
    onChartDataChange,
  }: DashboardGridProps) => {
    // Add state to track the selected chart
    const [selectedChartId, setSelectedChartId] = useState<string | null>(null);

    // Add state to track active date range filter
    const [dateRange, setDateRange] = useState<DateRange>({
      from: undefined,
      to: undefined,
    });

    // Add state to track local chart data changes
    const [localChartData, setLocalChartData] =
      useState<Map<string, any>>(chartData);

    // Update local chart data when chartData prop changes
    useEffect(() => {
      setLocalChartData(new Map(chartData));
    }, [chartData]);

    // Add state to track if a drag operation is in progress
    const [isDragging, setIsDragging] = useState(false);

    // Add state for keyword filter
    const [keyword, setKeyword] = useState<string>("");

    // Add state for filter dialog visibility
    const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);

    // Add state to track grid width
    const [gridWidth, setGridWidth] = useState(window.innerWidth);

    // Add a ref to the container div
    const containerRef = useRef<HTMLDivElement>(null);

    const isSidebarOpen = isEditing && !!selectedChartId && !isDragging;

    // Force grid layout to recalculate when sidebar opens/closes
    useEffect(() => {
      const updateWidth = () => {
        if (containerRef.current) {
          // Use the actual container width rather than a calculation
          setGridWidth(containerRef.current.offsetWidth);
        }
      };

      // Update width when sidebar state changes
      updateWidth();

      // Add a small delay to ensure the transition has completed
      const timeoutId = setTimeout(updateWidth, 350);

      // Add resize listener
      window.addEventListener("resize", updateWidth);

      return () => {
        window.removeEventListener("resize", updateWidth);
        clearTimeout(timeoutId);
      };
    }, [isSidebarOpen]);

    // Use useMemo for layouts to prevent recreating the object on every render
    const layouts = useMemo(
      () => ({
        lg: dashboard?.layout || [],
      }),
      [dashboard?.layout]
    );

    // Check if user owns the selected chart
    const isChartOwner = useMemo(() => {
      if (!selectedChartId) return false;
      const someChartData = localChartData.get(selectedChartId);
      const chartOwnerId = someChartData?.userId;

      return chartOwnerId === userId;
    }, [selectedChartId, localChartData, userId]);

    // Handle chart update - propagate up and update local state
    const handleChartUpdate = useCallback(
      (chartId: string, updates: any) => {
        // Update local state
        setLocalChartData((prevData) => {
          const newData = new Map(prevData);
          const chartToUpdate = newData.get(chartId);

          if (chartToUpdate) {
            newData.set(chartId, {
              ...chartToUpdate,
              ...updates,
            });
          }

          return newData;
        });

        // Propagate changes to parent components
        if (onChartDataChange) {
          onChartDataChange(chartId, updates);
        }
      },
      [onChartDataChange]
    );

    // Handle date range filter change
    const handleDateRangeChange = useCallback((range: DateRange) => {
      setDateRange(range);
    }, []);

    // Handle keyword filter change
    const handleKeywordChange = useCallback((value: string) => {
      setKeyword(value);
    }, []);

    // Create searchable data structures for Fuse.js
    const fuseChartIndex = useMemo(() => {
      // Create array of searchable chart metadata
      const chartIndexData = Array.from(localChartData.entries()).map(
        ([chartId, chart]) => ({
          chartId,
          title: chart.title || "",
          description: chart.description || "",
          type: chart.type || "",
          // Include other searchable chart properties
        })
      );

      // Configure Fuse for chart metadata search
      return new Fuse(chartIndexData, {
        keys: [
          { name: "title", weight: 2 }, // Prioritize title matches
          { name: "description", weight: 1 },
          { name: "type", weight: 0.5 },
        ],
        threshold: 0.3, // Lower threshold = stricter matching
        ignoreLocation: true,
        useExtendedSearch: true,
      });
    }, [localChartData]);

    // Create Fuse instances for each chart's data
    const fuseChartDataIndexes = useMemo(() => {
      const indexes = new Map<string, Fuse<any>>();

      localChartData.forEach((chart, chartId) => {
        if (chart.data && Array.isArray(chart.data) && chart.data.length > 0) {
          // Get field names to search from the first item
          const firstItem = chart.data[0];
          const keys = Object.keys(firstItem).map((key) => ({
            name: key,
            weight: 1,
          }));

          // Create Fuse instance for this chart's data
          indexes.set(
            chartId,
            new Fuse(chart.data, {
              keys,
              threshold: 0.3,
              ignoreLocation: true,
              useExtendedSearch: true,
              includeScore: true,
            })
          );
        }
      });

      return indexes;
    }, [localChartData]);

    // Apply filters to chart data
    const filteredChartData = useMemo(() => {
      const newChartData = new Map(localChartData);

      // First apply date filter if active
      if (dateRange.from) {
        // Create inclusive date range bounds
        const fromDate = new Date(dateRange.from);
        // Set start time to beginning of day
        fromDate.setHours(0, 0, 0, 0);

        let toDate: Date;
        if (dateRange.to) {
          // Make end date inclusive by setting it to end of day (23:59:59.999)
          toDate = new Date(dateRange.to);
          toDate.setHours(23, 59, 59, 999);
        } else {
          // If no end date, use current date (end of day)
          toDate = new Date();
          toDate.setHours(23, 59, 59, 999);
        }

        // Apply date filters to each chart
        newChartData.forEach((chartData, chartId) => {
          // Check if chart's creation date falls within the selected range
          let chartVisible = true;
          if (chartData.createdAt) {
            const chartDate = new Date(chartData.createdAt);
            if (chartDate < fromDate || chartDate > toDate) {
              chartVisible = false;
            }
          }

          // Apply date filtering to the chart's data if needed
          if (chartData?.data && Array.isArray(chartData.data)) {
            // Filter data points based on date range if chart has a date field
            const dateField = chartData.dateField || "date";

            const filtered = chartData.data.filter((item: any) => {
              // Skip if the item doesn't have a date field
              if (!item[dateField]) return true;

              const itemDate = new Date(item[dateField]);
              return itemDate >= fromDate && itemDate <= toDate;
            });

            newChartData.set(chartId, {
              ...chartData,
              filteredData: filtered,
              hidden: !chartVisible,
            });
          } else {
            // No data to filter, just set visibility
            newChartData.set(chartId, {
              ...chartData,
              hidden: !chartVisible,
            });
          }
        });
      }

      // Then apply keyword filter if active using Fuse.js
      if (keyword.trim()) {
        const searchTerm = keyword.trim();
        // Keep track of charts that match the search
        const matchingChartIds = new Set<string>();

        // 1. Search through chart metadata (titles, descriptions)
        const chartMetadataResults = fuseChartIndex.search(searchTerm);
        chartMetadataResults.forEach((result) => {
          matchingChartIds.add(result.item.chartId);
        });

        // 2. Search through each chart's data
        fuseChartDataIndexes.forEach((fuseInstance, chartId) => {
          const searchResults = fuseInstance.search(searchTerm);

          if (searchResults.length > 0) {
            // Chart has matching data
            matchingChartIds.add(chartId);

            // Filter the chart data to only include matching items
            const chart = newChartData.get(chartId);
            if (chart) {
              // Get all item indices that matched the search
              const matchingIndices = new Set(
                searchResults.map((result) => chart.data.indexOf(result.item))
              );

              // Filter the data to only include matching items or use original data if no valid indices found
              const dataToUse = chart.filteredData || chart.data;
              const keywordFiltered = dataToUse.filter((_: any, index: any) =>
                matchingIndices.has(index)
              );

              if (keywordFiltered.length > 0) {
                newChartData.set(chartId, {
                  ...chart,
                  filteredData: keywordFiltered,
                  hidden: false,
                });
              }
            }
          }
        });

        // Hide charts that don't match the search
        newChartData.forEach((chart, chartId) => {
          // Skip charts that are already hidden by date filter
          if (chart.hidden) return;

          // If chart doesn't match keyword search, hide it
          if (!matchingChartIds.has(chartId)) {
            newChartData.set(chartId, {
              ...chart,
              hidden: true,
            });
          }
        });
      }

      return newChartData;
    }, [
      localChartData,
      dateRange,
      keyword,
      fuseChartIndex,
      fuseChartDataIndexes,
    ]);

    // Get count of active filters
    const activeFiltersCount = useMemo(() => {
      let count = 0;
      if (dateRange.from) count++;
      if (keyword.trim()) count++;
      return count;
    }, [dateRange, keyword]);

    // Clear all filters
    const clearAllFilters = useCallback(() => {
      setDateRange({ from: undefined, to: undefined });
      setKeyword("");
    }, []);

    // Handle background click to deselect chart
    const handleBackgroundClick = () => {
      if (isEditing && selectedChartId) {
        setSelectedChartId(null);
      }
    };

    // Only render if dashboard is available
    if (!dashboard) {
      return <div>Loading dashboard...</div>;
    }

    // Get the selected chart data
    const selectedChartData = selectedChartId
      ? localChartData.get(selectedChartId)
      : null;

    // Determine if sidebar is open

    // Customize onLayoutChange to detect drag operations
    const handleLayoutChange = (layout: any) => {
      // Call original handler
      onLayoutChange(layout);

      // If we're currently dragging, don't select charts
      if (isDragging) {
        // Clear selection after drag completes
        setSelectedChartId(null);
      }
    };

    return (
      <div className="flex flex-col h-full">
        {/* Compact filter bar with button directly inline with badges */}
        <div className="bg-background border-border mb-3 rounded-md py-2 px-3 border">
          <div className="flex items-center justify-between">
            {/* Left side with active filters */}
            <div className="flex items-center gap-2 flex-wrap flex-1">
              {activeFiltersCount > 0 ? (
                <div className="flex items-center gap-2 flex-wrap">
                  {dateRange.from && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1 text-xs"
                    >
                      <span className="truncate max-w-[150px]">
                        {dateRange.from.toLocaleDateString()}
                        {dateRange.to
                          ? ` - ${dateRange.to.toLocaleDateString()}`
                          : ""}
                      </span>
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() =>
                          setDateRange({ from: undefined, to: undefined })
                        }
                      />
                    </Badge>
                  )}

                  {keyword && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1 text-xs"
                    >
                      <span className="truncate max-w-[150px]">{keyword}</span>
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => setKeyword("")}
                      />
                    </Badge>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="h-7 text-xs p-0 px-2"
                  >
                    Clear
                  </Button>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">
                  No filters applied
                </span>
              )}
            </div>

            {/* Right side with filter button - on same line as badges */}
            <Button
              variant={activeFiltersCount > 0 ? "default" : "outline"}
              size="sm"
              onClick={() => setIsFilterDialogOpen(true)}
              className="flex items-center ml-2 shrink-0"
            >
              <Filter className="h-4 w-4 mr-1" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Filter dialog */}
        <FilterDialog
          open={isFilterDialogOpen}
          onOpenChange={setIsFilterDialogOpen}
          dateRange={dateRange}
          onDateRangeChange={handleDateRangeChange}
          keyword={keyword}
          onKeywordChange={handleKeywordChange}
        />

        {/* Dashboard content area with adjusted height */}
        <div className="flex flex-row justify-end flex-1">
          {/* Main dashboard area with transition */}
          <div
            ref={containerRef}
            className={`relative grow transition-all duration-300 ease-in-out overflow-auto h-[calc(100vh-100px)] ${
              isSidebarOpen ? "pr-80" : ""
            }`}
            onClick={handleBackgroundClick}
          >
            <ResponsiveGridLayout
              className="layout mb-24 pb-32"
              breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
              cols={{ lg: 12, md: 12, sm: 12, xs: 12 }}
              rowHeight={30}
              draggableHandle=".drag-handle"
              isDraggable={isEditing}
              isResizable={isEditing}
              onLayoutChange={handleLayoutChange}
              layouts={layouts}
              preventCollision={false}
              allowOverlap={false}
              useCSSTransforms={true}
              resizeHandles={isEditing ? ["se"] : []}
              resizeHandle={
                <span className="absolute right-2 bottom-2 cursor-pointer">
                  <Expand className="w-4 h-4" />
                </span>
              }
              margin={[10, 10]}
              containerPadding={[5, 5]}
              width={gridWidth} // Use the dynamic width state
              onDragStart={() => setIsDragging(true)}
              onDragStop={() => {
                setTimeout(() => {
                  setIsDragging(false);
                }, 100);
              }}
              onWidthChange={(width) => {
                // Optionally handle width changes from the grid
                if (width !== gridWidth) {
                  setGridWidth(width);
                }
              }}
            >
              {/* Render all charts but make filtered ones invisible, even in editing mode */}
              {dashboard.charts.map((chartId) => {
                const chartData = filteredChartData.get(chartId);
                const isHidden = chartData?.hidden;

                // If hidden, don't render the chart at all - this ensures filters work in both modes
                if (isHidden) {
                  return (
                    <div
                      key={chartId}
                      className="hidden" // Use hidden class instead of opacity
                      aria-hidden="true"
                    />
                  );
                }

                return (
                  <div
                    key={chartId}
                    className={`border rounded-lg ${
                      isEditing && selectedChartId === chartId
                        ? "border-blue-400 shadow-md border-solid border-1"
                        : isEditing
                        ? "border-blue-400 shadow-xs border-dashed border-1"
                        : "border-gray-200"
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ChartItem
                      chartId={chartId}
                      chartData={chartData}
                      isEditing={isEditing}
                      isSelected={isEditing && selectedChartId === chartId}
                      onSelect={() => setSelectedChartId(chartId)}
                    />
                  </div>
                );
              })}
            </ResponsiveGridLayout>
          </div>

          {/* Chart edit sidebar */}
          <div
            className={`h-[calc(100vh-64px)] fixed right-0 top-16 transition-transform duration-300 ease-in-out ${
              isSidebarOpen ? "translate-x-0" : "translate-x-full"
            }`}
            style={{ width: "320px" }}
          >
            {isSidebarOpen && (
              <ChartEditSidebar
                chartData={selectedChartData}
                chartId={selectedChartId}
                isOpen={isSidebarOpen}
                onClose={() => setSelectedChartId(null)}
                isChartOwner={isChartOwner}
                userId={userId}
                onChartUpdate={handleChartUpdate}
              />
            )}
          </div>
        </div>
      </div>
    );
  },
  // Custom equality function remains unchanged
  (prevProps, nextProps) => {
    // Check if editing state changed
    if (prevProps.isEditing !== nextProps.isEditing) return false;

    // Check if user ID changed
    if (prevProps.userId !== nextProps.userId) return false;

    // Check if charts array changed
    const prevCharts = prevProps.dashboard?.charts || [];
    const nextCharts = nextProps.dashboard?.charts || [];
    if (prevCharts.length !== nextCharts.length) return false;

    // Check if any chart IDs changed
    const chartsChanged = prevCharts.some(
      (id, index) => id !== nextCharts[index]
    );
    if (chartsChanged) return false;

    // Check if layout changed
    if (prevProps.dashboard?.layout !== nextProps.dashboard?.layout)
      return false;

    // Check if chart data map reference changed
    if (prevProps.chartData !== nextProps.chartData) return false;

    // If we got here, props are considered equal
    return true;
  }
);

DashboardGrid.displayName = "DashboardGrid";
