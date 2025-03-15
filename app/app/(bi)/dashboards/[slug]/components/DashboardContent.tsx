import React, { useMemo } from "react";
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
  userId: string; // Add userId prop
}

export const DashboardContent: React.FC<DashboardContentProps> = ({
  dashboard,
  chartData,
  isEditing,
  chartUpdateCounter,
  tempChartsRef,
  tempLayoutsRef,
  setIsManageChartsOpen,
  onLayoutChange,
  userId, // Add userId to component props
}) => {
  // Memoize the dashboard object to prevent re-renders
  const dashboardForGrid = useMemo(() => {
    if (!dashboard) return null;

    return {
      ...dashboard,
      charts: isEditing ? tempChartsRef.current : dashboard.charts,
      layout: isEditing ? tempLayoutsRef.current : dashboard.layout,
    };
  }, [dashboard, isEditing, chartUpdateCounter, tempChartsRef, tempLayoutsRef]);

  // Memoize chart data to prevent re-renders
  const memoizedChartData = useMemo(() => chartData, [chartData]);

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
      chartData={memoizedChartData}
      isEditing={isEditing}
      onLayoutChange={onLayoutChange}
      userId={userId} // Pass userId to DashboardGrid
    />
  );
};
