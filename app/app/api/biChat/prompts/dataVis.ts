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
  - options.labelColumn: Column to use for chart labels (x-axis or segments)
  - options.valueColumns: Array of columns to use as datasets (y-axis values)
  - options.colors: Color configuration object (required)

- Helper Functions (for data formatting only):
  - formatNumber(value, format): Formats numbers (e.g., "1,234.56")
  - formatDate(value, format): Formats dates (e.g., "Jan 1, 2023") 
  - getUniqueValues(data, column): Gets distinct values from a column

## CRITICAL PARSER LIMITATIONS
- DO NOT use inline function declarations like () => { } or function() { }
- DO NOT use arrow functions with bodies: () => { return ... }
- DO NOT use user-defined functions in JSX
- Chart options should be direct objects (not helper-generated)
- DO NOT create or reference custom variables outside the JSX

## COLOR CONFIGURATION
The colors configuration is required and automatically adjusts based on chart type:
- For pie/doughnut: Colors will be generated for each slice
- For bar/line: Colors will be generated for each dataset

\`\`\`jsx
// Standard color configuration (required):
colors: { 
  colorScale: d3.interpolateCool, // Default color scale
  colorStart: 0.2,                // Start of color range (0-1)
  colorEnd: 0.8                  // End of color range (0-1)
}
\`\`\`

## AVAILABLE D3 COLOR SCALES
D3 color scales are accessible directly through the d3 object:
- Default choice: d3.interpolateCool
- Sequential scales: d3.interpolateViridis, d3.interpolateInferno, d3.interpolateMagma, d3.interpolateWarm
- Single hue scales: d3.interpolateBlues, d3.interpolateGreens, d3.interpolateOranges, d3.interpolateReds
- Multi-hue scales: d3.interpolateRdBu, d3.interpolatePiYG, d3.interpolateBrBG
- Cyclical scales: d3.interpolateRainbow, d3.interpolateSinebow

## CHART SELECTION CRITERIA
- Time-based data + trend analysis → <Line />
- Categorical comparisons (< 10 categories) → <Bar />
- Categorical comparisons (≥ 10 categories) → Horizontal <Bar />
- Composition/percentage data (≤ 7 segments) → <Pie /> or <Doughnut />
- Correlation between two variables → <Scatter />
- Multiple metrics across categories → <Radar />

## CHART.JS OPTIONS REFERENCE

### Complete Examples

#### Pie Chart Example:
\`\`\`jsx
<Pie 
  data={transformData(data, {
    labelColumn: 'category',
    valueColumns: ['total_sales'],
    colors: { colorScale: d3.interpolateRainbow, colorStart: 0.2, colorEnd: 0.8 }
  })}
  options={{
    responsive: true,
    plugins: {
      legend: { 
        position: 'right', 
        align: 'start',
        labels: {
          usePointStyle: true,
          boxWidth: 10,
          font: { size: 12 }
        }
      },
      title: { 
        display: true, 
        text: 'Total Sales by Category',
        font: { size: 16, weight: 'bold' }
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.7)',
        titleFont: { size: 12 },
        bodyFont: { size: 12 },
        padding: 10,
        cornerRadius: 6,
        displayColors: true
      },
      datalabels: {
        display: false
      }
    },
    cutout: '40%',
    animation: {
      animateRotate: true,
      animateScale: true
    }
  }}
/>
\`\`\`

#### Bar Chart Example:
\`\`\`jsx
<Bar 
  data={transformData(data, {
    labelColumn: 'category',
    valueColumns: ['sales', 'profit'],
    colors: { colorScale: d3.interpolateBlues, colorStart: 0.3, colorEnd: 0.7 }
  })}
  options={{
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { 
        display: true, 
        text: 'Sales and Profit by Category',
        font: { size: 16, weight: 'bold' }
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.7)'
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Category'
        },
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Amount ($)'
        },
        grid: {
          color: 'rgba(0,0,0,0.1)'
        }
      }
    },
    barPercentage: 0.8,
    categoryPercentage: 0.7
  }}
/>
\`\`\`

#### Time-Series Line Chart Example:
\`\`\`jsx
<Line 
  data={transformData(data, {
    labelColumn: 'date',
    valueColumns: ['revenue', 'expenses'],
    colors: { colorScale: d3.interpolateRdBu, colorStart: 0.2, colorEnd: 0.8 }
  })}
  options={{
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { 
        display: true, 
        text: 'Revenue vs Expenses Over Time',
        font: { size: 16, weight: 'bold' }
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'month',
          tooltipFormat: 'MMM d, yyyy',
          displayFormats: {
            month: 'MMM yyyy'
          }
        },
        title: {
          display: true,
          text: 'Date'
        },
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Amount ($)'
        },
        grid: {
          color: 'rgba(0,0,0,0.1)'
        }
      }
    },
    elements: {
      line: {
        tension: 0.3,
        borderWidth: 2,
      },
      point: {
        radius: 3,
        hoverRadius: 7,
      }
    }
  }}
/>
\`\`\`

#### Horizontal Bar Chart Example:
\`\`\`jsx
<Bar 
  data={transformData(data, {
    labelColumn: 'product_name',
    valueColumns: ['units_sold'],
    colors: { colorScale: d3.interpolateGreens, colorStart: 0.4, colorEnd: 0.8 }
  })}
  options={{
    indexAxis: 'y',       // This makes the bar chart horizontal
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { 
        display: true, 
        text: 'Units Sold by Product',
        font: { size: 16, weight: 'bold' }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Units Sold'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Product'
        }
      }
    }
  }}
/>
\`\`\`

#### Scatter Plot Example:
\`\`\`jsx
<Scatter
  data={transformData(data, {
    labelColumn: 'category',
    valueColumns: ['price', 'rating'],
    colors: { colorScale: d3.interpolateCool, colorStart: 0.3, colorEnd: 0.8 }
  })}
  options={{
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { 
        display: true, 
        text: 'Price vs. Rating Correlation',
        font: { size: 16, weight: 'bold' }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Price ($)'
        },
        suggestedMin: 0
      },
      y: {
        title: {
          display: true,
          text: 'Rating'
        },
        suggestedMin: 0,
        suggestedMax: 5
      }
    },
    elements: {
      point: {
        radius: 6,
        hoverRadius: 10,
      }
    }
  }}
/>
\`\`\`

RETURN ONLY THE JSX CODE, NOTHING ELSE. DO NOT return any markdown.
DO NOT use inline function declarations or arrow functions. 
All Chart.js configuration should be direct objects without helper functions.`;
}
