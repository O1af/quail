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
- Time series → <Line /> with smooth curves and gradient fills
- Categories (< 10) → <Bar /> with consistent color themes
- Categories (≥ 10) → Horizontal <Bar /> with indexAxis: 'y' and sorted values
- Parts of whole (≤ 7) → <Pie /> or <Doughnut /> with complementary colors
- Correlations → <Scatter /> with size variations and semi-transparency
- Multiple metrics across categories → <Radar /> with translucent fills
- Multiple series → <Line /> or <Bar /> with carefully chosen contrasting colors

## VISUAL AESTHETICS
- Use a consistent color palette that works in both light and dark modes
- Apply subtle gradients instead of flat colors when appropriate
- Add slight transparency (0.7-0.9) to improve overlapping elements
- Include thin borders (1px) on elements for definition
- Apply proper spacing between elements (padding/margin)
- Limit the number of elements to prevent visual clutter
- Sort data when appropriate (ascending/descending) for better comprehension

## D3 COLOR USAGE
Create beautiful color arrays from D3 scales:
\`\`\`jsx
// For vibrant sequential colors
const colors = Array.from({ length: count }, (_, i) => 
  d3.interpolateViridis(0.1 + (i / count) * 0.8)
);

// For pastel colors
const pastelColors = Array.from({ length: count }, (_, i) => 
  d3.interpolateCool(0.2 + (i / count) * 0.6)
);

// For complementary categorical colors
const categoryColors = Array.from({ length: count }, (_, i) =>
  d3.interpolateRainbow(i / count)
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
    time: { 
      unit: 'month', // Choose appropriate unit: day, week, month, quarter, year
      displayFormats: {
        day: 'MMM d',
        week: 'MMM d',
        month: 'MMM yyyy',
        quarter: 'QQQ yyyy',
        year: 'yyyy'
      }
    },
    adapters: { date: { zone: 'UTC' } },
    grid: {
      display: true,
      color: 'rgba(200, 200, 200, 0.15)', // Subtle grid lines
      borderDash: [5, 5] // Elegant dashed lines
    }
  }
}
\`\`\`
`
    : ""
}

## CHART STYLING BEST PRACTICES
- Add subtle gradients using createLinearGradient for Bar/Line charts
- Use rounded corners (borderRadius: 6) for bars
- Apply elegant animations with animation: { duration: 1000, easing: 'easeOutQuart' }
- Include meaningful tooltips with custom formatting
- Optimize whitespace with proper padding: { top: 20, right: 25, bottom: 30, left: 25 }
- Use grid lines sparingly and with low opacity (0.1-0.2)
- Apply soft shadows for emphasis: boxShadow: '0 4px 6px rgba(0,0,0,0.1)'

## LIMITATIONS
- Write only the ChartComponent function
- No functions outside ChartComponent
- No direct D3 scale object assignments
- Use only components from props
- ALWAYS access data from data.rows directly, NOT data.data.rows

RETURN ONLY THE COMPLETE ChartComponent FUNCTION WITHOUT EXPLANATION OR MARKDOWN.`;
}
