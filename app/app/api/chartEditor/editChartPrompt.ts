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
  # TASK: Modify the provided Chart.js visualization code based on user's request
  
  ## USER REQUEST
  "${prompt}"
  
  ## CURRENT CHART IMPLEMENTATION
  \`\`\`jsx
  ${currentJsx}
  \`\`\`
  
  ## DATA OVERVIEW
  - Query: ${query}
  - Rows: ${rowCount}
  - Columns: ${types.map((t) => `${t.colName} (${t.jsType})`).join(", ")}
  
  ## COMPONENT STRUCTURE
  Maintain this structure - DO NOT CHANGE:
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
    // ... your modifications here ...
    
    // 4. Return the appropriate chart component
    return (
      // ... your modifications here ...
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
  
  ## COMMON EDIT OPERATIONS
  
  1. Changing chart type:
  \`\`\`jsx
  // Change from Bar to Line
  return (
    <Line
      data={chartData}
      options={options}
    />
  );
  \`\`\`
  
  2. Adding data points/series:
  \`\`\`jsx
  const chartData = {
    // ...existing labels
    datasets: [
      // ...existing datasets
      {
        label: 'New Series',
        data: data.rows.map(row => row.newColumn),
        borderColor: d3.interpolateBlues(0.8),
        backgroundColor: d3.interpolateBlues(0.2)
      }
    ]
  };
  \`\`\`
  
  3. Changing colors:
  \`\`\`jsx
  // Sequential gradient:
  const colors = Array.from({ length: labels.length }, (_, i) => 
    d3.interpolateViridis(0.1 + (i / labels.length) * 0.8)
  );
  
  // Categorical:
  const colors = Array.from({ length: labels.length }, (_, i) => 
    d3.interpolateRainbow(i / labels.length)
  );
  \`\`\`
  
  4. Adjusting chart options:
  \`\`\`jsx
  const options = {
    // ...existing options
    plugins: {
      legend: {
        position: 'bottom',  // top, bottom, left, right
        labels: { color: textColor }
      },
      title: {
        display: true,
        text: 'New Chart Title',
        color: textColor
      }
    }
  };
  \`\`\`
  
  5. Sorting data:
  \`\`\`jsx
  // Sort data descending by value
  const sortedData = [...data.rows].sort((a, b) => b.value - a.value);
  const labels = sortedData.map(row => row.category);
  const values = sortedData.map(row => row.value);
  \`\`\`
  
  ## RESPONSE FORMAT
  RETURN ONLY THE COMPLETE ChartComponent FUNCTION - NO EXPLANATION, NO MARKDOWN.`;
}
