import React, { useMemo, useState, useCallback } from "react";
import { Dashboard } from "@/components/stores/dashboard_store";
import { ChartDocument } from "@/lib/types/stores/chart";
import { DashboardGrid } from "./DashboardGrid";
import { EmptyDashboardPlaceholder } from "./EmptyDashboardPlaceholder";

interface DashboardContentProps {
  dashboard: Dashboard | null;
  chartData: Map<string, ChartDocument | null>;
  isEditing: boolean;
  chartUpdateCounter: number;
  tempChartsRef: React.MutableRefObject<string[]>;
  tempLayoutsRef: React.MutableRefObject<any[]>;
  setIsManageChartsOpen: (open: boolean) => void;
  onLayoutChange: (layout: any) => void;
  userId: string;
  onChartDataUpdate?: (chartId: string, updates: any) => void;
}

export const DashboardContent: React.FC<DashboardContentProps> = ({
  dashboard,
  chartData: initialChartData,
  isEditing,
  chartUpdateCounter,
  tempChartsRef,
  tempLayoutsRef,
  setIsManageChartsOpen,
  onLayoutChange,
  userId,
  onChartDataUpdate,
}) => {
  // Keep a local copy of chart data that can be updated
  const [localChartData, setLocalChartData] =
    useState<Map<string, ChartDocument | null>>(initialChartData);

  // Update local chart data when the prop changes
  React.useEffect(() => {
    setLocalChartData(new Map(initialChartData));
  }, [initialChartData]);

  // Handle chart updates from child components
  const handleChartDataChange = useCallback(
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

      // Propagate to parent if needed
      if (onChartDataUpdate) {
        onChartDataUpdate(chartId, updates);
      }
    },
    [onChartDataUpdate]
  );

  // Memoize the dashboard object to prevent re-renders
  const dashboardForGrid = useMemo(() => {
    if (!dashboard) return null;

    return {
      ...dashboard,
      charts: isEditing ? tempChartsRef.current : dashboard.charts,
      layout: isEditing ? tempLayoutsRef.current : dashboard.layout,
    };
  }, [dashboard, isEditing, chartUpdateCounter, tempChartsRef, tempLayoutsRef]);

  // Rest of your component remains the same
  if (!dashboard?.charts) {
    return (
      <EmptyDashboardPlaceholder
        isEditing={isEditing}
        setIsManageChartsOpen={setIsManageChartsOpen}
      />
    );
  }

  const hasCharts = isEditing
    ? tempChartsRef.current.length > 0
    : dashboard.charts.length > 0;

  if (!hasCharts) {
    return (
      <EmptyDashboardPlaceholder
        isEditing={isEditing}
        setIsManageChartsOpen={setIsManageChartsOpen}
      />
    );
  }

  // Ensure we don't pass null to DashboardGrid
  if (!dashboardForGrid) {
    return (
      <EmptyDashboardPlaceholder
        isEditing={isEditing}
        setIsManageChartsOpen={setIsManageChartsOpen}
      />
    );
  }

  return (
    <DashboardGrid
      key={`grid-${isEditing ? "edit" : "view"}-${chartUpdateCounter}`}
      dashboard={dashboardForGrid}
      chartData={localChartData}
      isEditing={isEditing}
      onLayoutChange={onLayoutChange}
      userId={userId}
      onChartDataChange={handleChartDataChange}
    />
  );
};
