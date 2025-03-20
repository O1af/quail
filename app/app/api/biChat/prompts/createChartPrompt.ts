import { Message } from "ai";
import { PostgresResponse } from "@/lib/types/DBQueryTypes";

export function createChartPrompt({
  data,
  query,
  messages,
  userIntent = "",
}: {
  data: PostgresResponse;
  query: string;
  messages: Message[];
  userIntent?: string;
}): string {
  // Extract sample data (first 3 rows)
  const sampleRows = data.rows.slice(0, 3);
  const sampleData = JSON.stringify(sampleRows, null, 2);

  // Check if we have date columns in the result
  const dateColumns = data.types
    .filter((type) => type.jsType === "Date")
    .map((type) => type.colName);

  const hasDateColumns = dateColumns.length > 0;

  return `# CHART VISUALIZATION TASK

## USER REQUEST
${userIntent}

## DATA
- SQL: ${query}
- Rows: ${data.rows.length}
- Columns: ${data.types.map((t) => `${t.colName} (${t.jsType})`).join(", ")}
- Sample (${Math.min(3, data.rows.length)} of ${data.rows.length} rows):
\`\`\`json
${sampleData}
\`\`\`

## AVAILABLE PROPS
The ChartComponent function receives these props:
- data: The PostgresResponse object containing:
  * data.rows: Array of data objects [{ column1: value, column2: value, ... }, ...]
  * data.types: Array of column metadata [{ colName: string, jsType: string }, ...]
- components: Chart.js components:
  * Line, Bar, Pie, Doughnut, Scatter, Radar, PolarArea
- d3: D3.js color utilities (interpolateViridis, interpolateBlues, etc.)
- isDarkMode: Boolean (handled automatically by the renderer)

## COMPONENT STRUCTURE
\`\`\`jsx
function ChartComponent(props) {
  const { data, components, d3 } = props;
  const { Line, Bar, Pie, Doughnut, Scatter, Radar, PolarArea } = components;
  
  // IMPORTANT: Access data directly from data.rows, NOT data.data.rows
  const labels = data.rows.map(row => row.someColumn);
  const values = data.rows.map(row => row.numericColumn);
  
  // Data preparation
  const chartData = { 
    labels: labels, // Array of labels for chart (e.g., categories, dates)
    datasets: [{ 
      label: "",  // Series name
      data: values,   // Array of numeric values
      backgroundColor: [], // Array of colors
      borderColor: ""     // Border color
    }]
  };
  
  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    // Additional chart-specific options
  };
  
  return (<ChartType data={chartData} options={options} />);
}
\`\`\`

## CHART SELECTION GUIDE
- Time series → <Line />
- Categories (< 10) → <Bar />
- Categories (≥ 10) → Horizontal <Bar /> with indexAxis: 'y'
- Parts of whole (≤ 7) → <Pie /> or <Doughnut />
- Correlations → <Scatter />
- Multiple metrics across categories → <Radar />
- Multiple series → <Line /> or <Bar /> with multiple datasets

## D3 COLOR USAGE
Create color arrays from D3 scales:
\`\`\`jsx
const colors = Array.from({ length: count }, (_, i) => 
  d3.interpolateViridis(0.1 + (i / count) * 0.8)
);
\`\`\`

${
  hasDateColumns
    ? `## DATE COLUMN HANDLING
For date columns (${dateColumns.join(", ")}):
\`\`\`jsx
scales: {
  x: {
    type: 'time',
    time: { unit: 'month' }, // or day, week, year
    adapters: { date: { zone: 'UTC' } }
  }
}
\`\`\`
`
    : ""
}

## LIMITATIONS
- Write only the ChartComponent function
- No functions outside ChartComponent
- No direct D3 scale object assignments
- Use only components from props
- ALWAYS access data from data.rows directly, NOT data.data.rows

RETURN ONLY THE COMPLETE ChartComponent FUNCTION WITHOUT EXPLANATION OR MARKDOWN.`;
}
