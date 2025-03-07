import { DatabaseStructure } from "@/components/stores/table_store";
import { Message } from "ai";
import {
  formatConversationHistory,
  formatDatabaseSchema,
} from "../utils/format";
import { PostgresResponse } from "@/lib/types/DBQueryTypes";

export function createSqlPrompt({
  messages,
  dbType,
  databaseStructure,
}: {
  messages: Message[];
  dbType: string;
  databaseStructure: DatabaseStructure;
}): string {
  return `Database Type: ${dbType}

Schema:
${formatDatabaseSchema(databaseStructure, false)}

# CONVERSATION HISTORY
${formatConversationHistory(messages, 10, false)}

# TASK: Generate a visualization-ready SQL query that directly answers the user's request

## CRITICAL REQUIREMENTS:
- ONLY use tables/columns that EXIST in the schema above
- Use proper table qualification for all column references in JOINs
- Apply filters ONLY based on user's explicit requirements
- DO NOT add arbitrary time filters unless user specifically asks for a time period
- Prefer recent data when time filtering is necessary, but avoid overly restrictive conditions
- USE correct ${dbType} syntax for date/string functions

## QUERY STRUCTURE:
- SELECT: Choose meaningful metrics (numeric) and dimensions (categorical) for visualization
- JOIN: Use only when necessary with explicit ON conditions
- WHERE: Only include filters directly related to user's request
- GROUP BY: Include for all non-aggregated columns
- LIMIT: Include appropriate limit based on visualization needs (typically 10-20 rows)

## OPTIMIZATION FOR VISUALIZATION:
- If user requests a PIE CHART: Select 1 categorical column and 1 numeric measure, limit to 5-7 categories
- If user requests a BAR CHART: Select 1-2 categorical columns and 1-3 numeric measures
- If user requests a LINE CHART: Select 1 time-based column and 1-3 numeric measures with proper time ordering
- If user requests a SCATTER PLOT: Select exactly 2 numeric measures for correlation analysis
- Balance 1-2 categorical columns (x-axis/grouping) with 1-3 metrics (y-axis)
- For time series: Use appropriate date functions (${
    dbType === "postgres"
      ? "DATE_TRUNC"
      : dbType === "mysql"
      ? "DATE_FORMAT"
      : "TRUNC"
  })
- Prefer relative date ranges over absolute ones when appropriate
- Round decimal values for readability

## ERROR PREVENTION:
- Verify all column references are from tables in FROM/JOIN clauses
- Avoid overly specific filters that might return no data
- Double check table/column names against the schema
- Ensure numeric columns are used for metrics and categorical for dimensions

IMPORTANT: DO NOT FORMAT YOUR RESPONSE AS MARKDOWN. DO NOT USE BACKTICKS, CODE BLOCKS OR ANY MARKDOWN SYNTAX.
RETURN ONLY THE RAW SQL QUERY WITHOUT ANY FORMATTING OR EXPLANATIONS.`;
}

// New function for query validation and reformulation
export function createQueryValidationPrompt({
  originalQuery,
  errorMessage,
  dbType,
  databaseStructure,
}: {
  originalQuery: string;
  errorMessage: string;
  dbType: string;
  databaseStructure: DatabaseStructure;
}): string {
  return `# TASK: Fix the SQL query that returned an error or no results

## DATABASE TYPE
${dbType}

## DATABASE SCHEMA
${formatDatabaseSchema(databaseStructure, true)}

## ORIGINAL QUERY
\`\`\`sql
${originalQuery}
\`\`\`

## ERROR MESSAGE
${errorMessage}

## COMMON ISSUES TO CHECK
- Table/column names (misspelled or missing)
- Unqualified column references in joins
- Missing GROUP BY for non-aggregate columns
- Incorrect data types in conditions
- Tables referenced not in schema
- UNNECESSARY TIME FILTERS when user didn't specify a time period
- OVERLY RESTRICTIVE conditions returning no data
- Invalid SQL syntax specific to ${dbType}

## FIX PRIORITY
1. REMOVE unnecessary time filters if not requested by user
2. BROADEN date ranges if present
3. RELAX strict conditions (= to LIKE/BETWEEN/IN)
4. REMOVE secondary filter conditions
5. SIMPLIFY the query while maintaining intent

## INSTRUCTIONS
1. For syntax errors: Fix technical issues
2. For empty results: Focus on broadening filters
3. Ensure query still addresses the original intent
4. Return ONLY the fixed SQL with no explanations

RETURN JUST THE FIXED SQL QUERY, NOTHING ELSE, NO MARKDOWN.`;
}

export function createChartPrompt({
  data,
  query,
  messages,
}: {
  data: PostgresResponse;
  query: string;
  messages: Message[];
}): string {
  // Check if we have date columns in the result
  const dateColumns = data.types
    .filter((type) => type.jsType === "Date")
    .map((type) => type.colName);

  const hasDateColumns = dateColumns.length > 0;

  return `
# TASK: Generate JSX code that renders a Chart.js visualization for the data

## USER INTENT
${formatConversationHistory(messages, 5)}

## QUERY EXECUTED
\`\`\`sql
${query}
\`\`\`

## RESULT
${data.rows.length} rows

## COLUMN DETAILS
${data.types.map((type) => `- ${type.colName}: ${type.jsType}`).join("\n")}

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

## CHART SELECTION GUIDE
- Time-based trends → <Line />
- Categorical comparisons (< 10 categories) → <Bar />
- Categorical comparisons (≥ 10 categories) → Horizontal <Bar /> with indexAxis: 'y'
- Composition/percentage (≤ 7 segments) → <Pie /> or <Doughnut />
- Correlation between variables → <Scatter />
- Multiple metrics across categories → <Radar />
- Multiple series over time → <Line /> with seriesColumn

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

## CHART EXAMPLES

### Basic Charts

#### Bar/Column Chart
\`\`\`jsx
<Bar 
  data={transformData(data, {
    labelColumn: 'dimension',
    valueColumns: ['metric1', 'metric2'],
    colors: { colorScale: d3.interpolateBlues, colorStart: 0.3, colorEnd: 0.8 }
  })}
  options={{
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Comparison by Dimension' }
    },
    scales: {
      x: { title: { display: true, text: 'Dimension' } },
      y: { beginAtZero: true, title: { display: true, text: 'Value' } }
    }
  }}
/>
\`\`\`

#### Horizontal Bar (for many categories)
\`\`\`jsx
<Bar 
  data={transformData(data, {
    labelColumn: 'category',
    valueColumns: ['value'],
    colors: { colorScale: d3.interpolateGreens, colorStart: 0.4, colorEnd: 0.8 }
  })}
  options={{
    indexAxis: 'y',
    responsive: true,
    plugins: { title: { display: true, text: 'Values by Category' } },
    scales: {
      x: { beginAtZero: true, title: { display: true, text: 'Value' } },
      y: { title: { display: true, text: 'Category' } }
    }
  }}
/>
\`\`\`

#### Pie/Doughnut Chart
\`\`\`jsx
<Pie 
  data={transformData(data, {
    labelColumn: 'category',
    valueColumns: ['value'],
    colors: { colorScale: d3.interpolateSpectral, colorStart: 0.2, colorEnd: 0.8 }
  })}
  options={{
    responsive: true,
    plugins: {
      legend: { position: 'right' },
      title: { display: true, text: 'Distribution by Category' }
    }
  }}
/>
\`\`\`

### Time Series & Multi-Series

#### Time Series Chart
\`\`\`jsx
<Line 
  data={transformData(data, {
    labelColumn: 'date',
    valueColumns: ['metric'],
    colors: { colorScale: d3.interpolateRdBu, colorStart: 0.2, colorEnd: 0.8 }
  })}
  options={{
    responsive: true,
    plugins: {
      title: { display: true, text: 'Trend Over Time' }
    },
    scales: {
      x: {
        type: 'time',
        parsing: false,
        time: { unit: 'month', displayFormats: { month: 'MMM yyyy' } },
        adapters: { date: { zone: 'UTC' } },
        title: { display: true, text: 'Date' }
      },
      y: { beginAtZero: true, title: { display: true, text: 'Value' } }
    }
  }}
/>
\`\`\`

#### Multi-Series Chart
\`\`\`jsx
<Line 
  data={transformData(data, {
    labelColumn: 'dimension',
    valueColumns: ['value'],
    seriesColumn: 'category',
    colors: { colorScale: d3.interpolateViridis, colorStart: 0.2, colorEnd: 0.8 }
  })}
  options={{
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Values by Category' }
    },
    scales: {
      x: { title: { display: true, text: 'Dimension' } },
      y: { beginAtZero: true, title: { display: true, text: 'Value' } }
    }
  }}
/>
\`\`\`

#### Scatter Plot (correlation)
\`\`\`jsx
<Scatter
  data={transformData(data, {
    labelColumn: 'category',
    valueColumns: ['x_value', 'y_value'],
    colors: { colorScale: d3.interpolateCool, colorStart: 0.3, colorEnd: 0.8 }
  })}
  options={{
    responsive: true,
    plugins: { title: { display: true, text: 'Correlation Between Values' } },
    scales: {
      x: { title: { display: true, text: 'X Value' } },
      y: { title: { display: true, text: 'Y Value' } }
    }
  }}
/>
\`\`\`

RETURN ONLY THE JSX CODE, NOTHING ELSE. DO NOT return any markdown.
DO NOT use inline function declarations or arrow functions. 
All Chart.js configuration should be direct objects without helper functions.`;
}
