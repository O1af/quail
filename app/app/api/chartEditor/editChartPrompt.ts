import { ColumnType } from "@/lib/types/DBQueryTypes";

export function createChartEditPrompt({
  prompt,
  currentJsx,
  types,
  rowCount,
  query,
}: {
  prompt: string;
  currentJsx: string;
  types: ColumnType[];
  rowCount: number;
  query: string;
}): string {
  // Check if we have date columns in the result
  const dateColumns = types
    .filter((type) => type.jsType === "Date")
    .map((type) => type.colName);

  const hasDateColumns = dateColumns.length > 0;

  return `
# TASK: Modify the provided Chart.js visualization code based on the user's request

## USER REQUEST
${prompt}

## CURRENT CHART CODE
\`\`\`jsx
${currentJsx}
\`\`\`

## QUERY EXECUTED
\`\`\`sql
${query}
\`\`\`

## DATA STRUCTURE
${types.map((type) => `- ${type.colName}: ${type.jsType}`).join("\n")}
Total rows: ${rowCount}

## AVAILABLE COMPONENTS AND UTILITIES
- Chart components: <Line>, <Bar>, <Pie>, <Doughnut>, <Scatter>, <Bubble>, <Radar>, <PolarArea>
- transformData(data, options): Transforms raw data into Chart.js format
  - options.labelColumn: Column for x-axis or segments
  - options.valueColumns: Array of columns for y-axis values
  - options.seriesColumn: Optional column to split data into series
  - options.colors: Color configuration (required)
- Helper Functions: formatNumber(value, format), formatDate(value, format), getUniqueValues(data, column)

## CRITICAL PARSER LIMITATIONS
- NO inline functions: ❌ () => { } ❌ function() { }
- NO arrow functions with bodies: ❌ () => { return ... }
- NO user-defined functions in JSX
- Chart options must be direct objects
- NO custom variables outside JSX

## COLOR CONFIGURATION
\`\`\`jsx
// Required color configuration:
colors: { 
  colorScale: d3.interpolateCool, // Use d3 color scale
  colorStart: 0.2,                // Start of color range (0-1)
  colorEnd: 0.8                  // End of color range (0-1)
}
\`\`\`

## AVAILABLE D3 COLOR SCALES
- Sequential: d3.interpolateViridis, d3.interpolateInferno, d3.interpolateMagma, d3.interpolateWarm, d3.interpolateCool
- Single hue: d3.interpolateBlues, d3.interpolateGreens, d3.interpolateOranges, d3.interpolateReds
- Multi-hue: d3.interpolateRdBu, d3.interpolatePiYG, d3.interpolateBrBG
- Cyclical: d3.interpolateRainbow, d3.interpolateSinebow

${
  hasDateColumns
    ? `
## DATE HANDLING (${dateColumns.join(", ")})
For time-based charts, ALWAYS include these settings to prevent timezone issues:
\`\`\`jsx
scales: {
  x: {
    type: 'time',
    parsing: false,         // Important when data is already Date objects
    offset: true,           // Helps align labels with data points
    time: {                 // Customize based on data granularity
      unit: 'month',        // day, week, month, year, etc.
      displayFormats: { month: 'MMM yyyy' }
    },
    adapters: {
      date: { zone: 'UTC' }
    },
    title: { display: true, text: 'Date' }
  }
}
\`\`\`
`
    : ""
}

## CHART SELECTION GUIDE
- Time-based trends → <Line />
- Categorical comparisons (< 10 categories) → <Bar />
- Categorical comparisons (≥ 10 categories) → Horizontal <Bar /> with indexAxis: 'y'
- Composition/percentage (≤ 7 segments) → <Pie /> or <Doughnut />
- Correlation between variables → <Scatter />
- Multiple metrics across categories → <Radar />
- Multiple series over time → <Line /> with seriesColumn

## INSTRUCTIONS
1. Understand the user's request and current chart code
2. Make minimal changes to address the user's request
3. Maintain the same chart type unless explicitly asked to change it
4. Ensure all chart properties remain valid with changes
5. Keep all required configuration sections

RETURN ONLY THE COMPLETE UPDATED JSX CODE, NOTHING ELSE. DO NOT return any markdown.
DO NOT use inline function declarations or arrow functions. 
All Chart.js configuration should be direct objects without helper functions.`;
}
