import { Message } from "ai";
import { PostgresResponse } from "@/lib/types/DBQueryTypes";

export function createChartPrompt({
  data,
  query,
  messages,
}: {
  data: PostgresResponse;
  query: string;
  messages: Message[];
}): string {
  // Extract sample data (first 3 rows)
  const sampleRows = data.rows.slice(0, 3);
  const sampleData = JSON.stringify(sampleRows, null, 2);

  // Check if we have date columns in the result
  const dateColumns = data.types
    .filter((type) => type.jsType === "Date")
    .map((type) => type.colName);

  const hasDateColumns = dateColumns.length > 0;

  // Extract most recent user message to better understand intent
  const recentUserMessages = messages
    .filter((msg) => msg.role === "user")
    .slice(-2)
    .map((msg) => msg.content);

  return `
  # TASK: Generate a complete ChartComponent function that visualizes SQL query results
  
  ## USER INTENT
  Recent user request: "${recentUserMessages.join(" ")}"
  
  ## DATA OVERVIEW
  - Query: ${query}
  - Rows: ${data.rows.length}
  - Columns: ${data.types.map((t) => `${t.colName} (${t.jsType})`).join(", ")}
  - Sample Data (first ${sampleRows.length} rows): 
  \`\`\`json
  ${sampleData}
  \`\`\`
  
  ## COMPONENT STRUCTURE
  \`\`\`jsx
  function ChartComponent(props) {
    // 1. Extract props
    const { data, components, d3, isDarkMode } = props;
    const { Line, Bar, Pie, Doughnut, Scatter, Radar, PolarArea } = components;
    
    // 2. Validate data
    if (!data || !data.rows || data.rows.length === 0) {
      return <div>No data available to display</div>;
    }
    
    // 3. Data analysis and preparation
    const chartData = {
      labels: [...],
      datasets: [...]
    };
    
    // 4. Theme-aware options
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      // Additional options
    };
    
    // 5. Return the appropriate chart component
    return (
      <ChartType 
        data={chartData}
        options={options}
      />
    );
  }
  \`\`\`
  
  ## CRITICAL PARSER LIMITATIONS
  - NO user-defined functions outside the ChartComponent function
  - Chart options must be direct objects
  - NO custom variables outside JSX
  - CANNOT use D3 scale objects directly as values
  
  ## COLOR HANDLING
  ALWAYS convert D3 color scales to arrays of string values:
  
  \`\`\`jsx
  // CORRECT:
  const colors = Array.from({ length: count }, (_, i) => 
    d3.interpolateViridis(0.1 + (i / count) * 0.8)
  );
  
  // WRONG - will cause runtime errors:
  const colors = d3.interpolateViridis; // ❌
  \`\`\`
  
  ## AVAILABLE D3 COLOR SCALES
  - Sequential: d3.interpolateViridis, d3.interpolateInferno, d3.interpolateMagma, d3.interpolateWarm, d3.interpolateCool
  - Single hue: d3.interpolateBlues, d3.interpolateGreens, d3.interpolateOranges, d3.interpolateReds
  - Multi-hue: d3.interpolateRdBu, d3.interpolatePiYG, d3.interpolateBrBG
  - Cyclical: d3.interpolateRainbow, d3.interpolateSinebow
  
  ## THEME SUPPORT
  Use the isDarkMode prop to set appropriate colors:
  \`\`\`jsx
  const textColor = isDarkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)";
  const gridColor = isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";
  
  const options = {
    scales: {
      x: {
        grid: { color: gridColor },
        ticks: { color: textColor }
      },
      y: {
        grid: { color: gridColor },
        ticks: { color: textColor }
      }
    },
    plugins: {
      legend: {
        labels: { color: textColor }
      }
    }
  };
  \`\`\`
  
  ${
    hasDateColumns
      ? `
  ## DATE HANDLING (${dateColumns.join(", ")})
  For time-based charts, include these settings to prevent timezone issues:
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
  
  ## CHART TYPE SELECTION GUIDE
  Analyze the data structure first:
  - Time-based trends → <Line />
  - Categorical comparisons (< 10 categories) → <Bar />
  - Categorical comparisons (≥ 10 categories) → Horizontal <Bar /> with indexAxis: 'y'
  - Composition/percentage (≤ 7 segments) → <Pie /> or <Doughnut />
  - Correlation between variables → <Scatter />
  - Multiple metrics across categories → <Radar />
  - Multiple series over time → <Line /> with multiple datasets
  
  ## DATA PROCESSING PATTERNS
  For common data patterns:
  
  1. Simple category comparison:
  \`\`\`jsx
  const labels = data.rows.map(row => row.categoryColumn);
  const values = data.rows.map(row => row.valueColumn);
  
  const chartData = {
    labels,
    datasets: [{
      label: 'Value',
      data: values,
      backgroundColor: Array.from({ length: labels.length }, (_, i) => 
        d3.interpolateBlues(0.2 + (i / labels.length) * 0.6)
      )
    }]
  };
  \`\`\`
  
  2. Time series:
  \`\`\`jsx
  const chartData = {
    labels: data.rows.map(row => new Date(row.dateColumn)),
    datasets: [{
      label: 'Value',
      data: data.rows.map(row => row.valueColumn),
      borderColor: isDarkMode ? 'rgba(29, 78, 216, 0.8)' : 'rgba(37, 99, 235, 1)',
      backgroundColor: isDarkMode ? 'rgba(29, 78, 216, 0.2)' : 'rgba(37, 99, 235, 0.1)',
      borderWidth: 2,
      tension: 0.3
    }]
  };
  \`\`\`
  
  3. Multiple series:
  \`\`\`jsx
  // Get unique categories
  const categories = [...new Set(data.rows.map(row => row.categoryColumn))];
  
  // Group data by series
  const chartData = {
    labels: [...], // Common labels
    datasets: categories.map((category, index) => ({
      label: category,
      data: [...], // Values for this category
      borderColor: d3.interpolateCool(0.1 + (index / categories.length) * 0.8),
      backgroundColor: d3.interpolateCool(0.1 + (index / categories.length) * 0.8) + '40'
    }))
  };
  \`\`\`
  
  RETURN ONLY THE COMPLETE ChartComponent FUNCTION - NO EXPLANATION, NO MARKDOWN.`;
}
