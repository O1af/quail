import { LayoutItem } from "@/components/stores/dashboard_store";

/**
 * Creates a default layout item for a new chart
 *
 * @param chartId - ID of the chart to create layout for
 * @param existingLayout - Existing layout items to position new item relative to
 * @param index - Index of the new chart (for stacking multiple new charts)
 * @returns A layout item with default position and size
 */
export function createDefaultLayoutItem(
  chartId: string,
  existingLayout: LayoutItem[] = [],
  index = 0
): LayoutItem {
  // Calculate the max Y position to place new charts below existing ones
  const maxY =
    existingLayout.length > 0
      ? Math.max(...existingLayout.map((item) => item.y + item.h))
      : 0;

  // Default sizes
  const defaultWidth = 12; // Full width by default
  const defaultHeight = 9; // Default height

  // Return properly positioned layout item
  return {
    i: chartId,
    x: 0, // Start at the left edge
    y: maxY + index * defaultHeight, // Stack vertically
    w: defaultWidth,
    h: defaultHeight,
    minW: 3, // Minimum width
    minH: 3, // Minimum height
  };
}

/**
 * Creates layout items for multiple new charts
 *
 * @param chartIds - Array of chart IDs to create layouts for
 * @param existingLayout - Existing layout items
 * @returns Array of layout items for the new charts
 */
export function createLayoutsForNewCharts(
  chartIds: string[],
  existingLayout: LayoutItem[] = []
): LayoutItem[] {
  return chartIds.map((chartId, index) =>
    createDefaultLayoutItem(chartId, existingLayout, index)
  );
}
