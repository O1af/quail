/**
 * Configuration for color range generation
 */
export interface ColorRangeInfo {
  /** Starting point in the color scale (0-1) */
  colorStart: number;
  /** Ending point in the color scale (0-1) */
  colorEnd: number;
  /** Whether to use the end of the color scale as the starting point */
  useEndAsStart: boolean;
}

/**
 * Calculate a point in the color range
 */
function calculatePoint(
  colorRangeInfo: ColorRangeInfo,
  i: number,
  intervalSize: number
): number {
  const { colorStart, colorEnd, useEndAsStart } = colorRangeInfo;
  return useEndAsStart
    ? colorEnd - i * intervalSize
    : colorStart + i * intervalSize;
}

/**
 * Generate an array of colors based on data length
 *
 * @param dataLength - Number of data points
 * @param colorScale - A function that maps a number in range [0,1] to a color string
 * @param colorRangeInfo - Configuration for the color range
 * @returns Array of color strings
 */
export function generateColors(
  dataLength: number,
  colorScale: (t: number) => string,
  colorRangeInfo: ColorRangeInfo = {
    colorStart: 0,
    colorEnd: 1,
    useEndAsStart: false,
  }
): string[] {
  const { colorStart, colorEnd } = colorRangeInfo;
  const colorRange = colorEnd - colorStart;
  const intervalSize = colorRange / dataLength;
  const colorArray: string[] = [];

  for (let i = 0; i < dataLength; i++) {
    const colorPoint = calculatePoint(colorRangeInfo, i, intervalSize);
    colorArray.push(colorScale(colorPoint));
  }

  return colorArray;
}
