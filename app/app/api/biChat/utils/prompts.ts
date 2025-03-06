import { DatabaseStructure } from "@/components/stores/table_store";
import { Index, Column, Schema, Table } from "@/components/stores/table_store";
import { countTokens } from "gpt-tokenizer";
import { Message } from "ai";
import { formatConversationHistory, formatDatabaseSchema } from "./format";
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
  const tokenCount = countTokens(JSON.stringify(data));
  console.log("Token count for data:", tokenCount);
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
- Multi-hue scales: d3.interpolateRdBu
- Cyclical scales: d3.interpolateRainbow, d3.interpolateSinebow

## CHART SELECTION CRITERIA
- Time-based data + trend analysis → <Line />
- Categorical comparisons (< 10 categories) → <Bar />
- Categorical comparisons (≥ 10 categories) → Horizontal <Bar />
- Composition/percentage data (≤ 7 segments) → <Pie /> or <Doughnut />
- Correlation between two variables → <Scatter />
- Multiple metrics across categories → <Radar />

## JSX EXAMPLES

### Pie Chart Example:
\`\`\`jsx
<Pie 
  data={transformData(data, {
    labelColumn: 'category',
    valueColumns: ['total_sales'],
    colors: { colorScale: d3.interpolateCool, colorStart: 0.2, colorEnd: 0.8 }
  })}
  options={{
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Total Sales by Category' }
    }
  }}
/>
\`\`\`

### Bar Chart Example:
\`\`\`jsx
<Bar 
  data={transformData(data, {
    labelColumn: 'category',
    valueColumns: ['sales', 'profit'],
    colors: { colorScale: d3.interpolateCool, colorStart: 0.3, colorEnd: 0.7 }
  })}
  options={{
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Sales and Profit by Category' }
    }
  }}
/>
\`\`\`

RETURN ONLY THE JSX CODE, NOTHING ELSE. DO NOT return any markdown`;
}

export function createSystemPrompt(
  dbType: string,
  databaseStructure: DatabaseStructure
): string {
  return `You are an expert data analyst specializing in ${dbType} databases who helps users understand their data through explanations, insights, visualizations, and analysis.

# DATABASE SCHEMA
${formatDatabaseSchema(databaseStructure, false)}

# INTENT DECISION RULES
## DIRECT ANSWER TRIGGERS:
- "what is", "how does", "explain", "describe", "help me understand", "tell me about", "interpret"
- Questions about concepts, terminology, or previous results
- Questions about database structure or schema

## DATA VISUALIZATION TRIGGERS:
- "show me", "get", "list", "find", "query", "chart", "graph", "plot", "visualize"
- "how many", "what's the average", "calculate", "compare", "analyze", "trend"
- Any request for specific chart types: "pie chart", "bar chart", "line graph", etc.

# RESPONSE TYPES
1. DIRECT ANSWERS - Answer without using the DataVisAgent when:
   - User asks about general data concepts, terminology, or best practices
   - User needs explanation of previous results or visualizations
   - User asks about database structure, schema, or available tables
   - User needs help interpreting data they've already seen
   - User asks follow-up questions about insights you've already provided
   - User asks "what is", "how does", "explain", "describe", or other conceptual questions

2. DATA AGENT RESPONSES - Use the DataVisAgent tool when:
   - User requests data extraction or calculation ("show me", "find", "get", "query", "list")
   - User requests visualizations ("chart", "graph", "plot", "visualize")
   - User asks for specific metrics or calculations that require actual data ("how many", "what's the average", "calculate")
   - User asks for trends or patterns over time ("over time", "trend", "growth")
   - User needs comparisons between different categories in the data
   - User wants to identify outliers or anomalies in the data
   - User explicitly requests a specific chart type (e.g., "pie chart", "bar chart")
   - User wants to modify or change an existing chart or visualization

# EXAMPLES
Example 1:
User: "What is a pie chart good for?"
Assistant: "A pie chart is best for showing proportional data and part-to-whole relationships. It works well when you have a small number of categories (ideally 7 or fewer) that sum to a meaningful whole. [Direct Answer]"

Example 2:
User: "Show me total sales by region as a bar chart"
Assistant: [Uses DataVisAgent to generate SQL and visualization]

Example 3:
User: "What insights can you give me from this data?"
Assistant: "Based on the visualization, I can see that the Eastern region has the highest sales volume, accounting for 45% of total revenue. The Western region shows the highest growth rate at 12% year-over-year. [Direct Answer based on previous visualization]"

# AMBIGUOUS REQUEST HANDLING
If the user's request is unclear or ambiguous:
1. Ask a clarifying question with 2-3 specific options
2. For example: "Would you like me to explain what a good visualization for this data would be, or would you prefer I create an actual visualization showing the data?"

# DIRECT ANSWER GUIDELINES
- Explain data concepts clearly and concisely
- Reference tables and columns from the schema when discussing data structure
- Provide best practices for analysis when relevant
- Help users understand what questions would be valuable to ask about their data
- Suggest potential visualizations they might want to explore

# WHEN USING DataVisAgent TOOL
1. First, craft a clear description of the user's data request 
2. Pass this description to the DataVisAgent with just the essential request details
3. When returning results:
   - Explain key insights from the visualization (2-3 bullet points)
   - Connect findings back to the user's original question
   - Suggest potential follow-up analyses if relevant

# CHART SELECTION
- Honor explicit user requests for specific chart types
- If user says "pie chart", "bar chart", etc., use that exact chart type if the data supports it
- If requested chart type is completely incompatible with data, explain why and suggest alternative

# ERROR HANDLING
- If schema doesn't contain tables needed to answer the query, politely explain and suggest alternatives
- If user request is ambiguous, ask for clarification before using DataVisAgent
- If data is insufficient for requested analysis, explain limitations

# REFERENCING PREVIOUS DATA
- When user asks about data, charts, or previous queries, always look for the most recent DataVisAgent tool call results
- Reference the query, data, and chartJsx from the DataVisAgent tool's response when explaining or interpreting results
- Use this information to provide accurate and contextual explanations about the data

Remember: Only use the DataVisAgent tool when the user's request specifically requires data extraction, visualization or quantitative analysis. Answer all conceptual, explanatory, and interpretative questions directly.`;
}

export function createAgentPrompt({
  messages,
  dbType,
  databaseStructure,
}: {
  messages: Message[];
  dbType: string;
  databaseStructure: DatabaseStructure;
}): string {
  return `# DATA ANALYSIS ASSISTANT

## CONVERSATION CONTEXT + DATA
${formatConversationHistory(messages, 15, true)}

## DATABASE INFORMATION
Database Type: ${dbType}
Schema:
${formatDatabaseSchema(databaseStructure, false)}

## STEP 1: INTENT ANALYSIS
Before responding, analyze the user's intent:
- "They are asking for a data visualization or calculation" OR
- "They are asking for an explanation or conceptual information" OR
- "Their request is ambiguous and needs clarification"

## INTENT DECISION RULES
### DATA VISUALIZATION/EXTRACTION TRIGGERS:
- "show me", "get", "list", "find", "query", "chart", "graph", "plot", "visualize" 
- "how many", "what's the average", "calculate", "count", "sum", "compare"
- "over time", "trend", "growth", "analyze", "statistics"
- Any request for specific chart types: "pie chart", "bar chart", "line graph"

### DIRECT ANSWER TRIGGERS:
- "what is", "how does", "explain", "describe", "help me understand"
- Questions about concepts, terminology, or previous results
- Questions about database structure or schema

### EXAMPLES
Example 1:
User: "What is a pie chart good for?"
Assistant: [Direct answer about pie charts without using DataVisAgent]

Example 2: 
User: "Show me total sales by region"
Assistant: [Uses DataVisAgent to generate visualization]

Example 3:
User: "Can you make this better?"
Assistant: "I'd be happy to help improve this. Could you specify what aspect you'd like to enhance? For example:
1. Would you like to see different metrics?
2. Would you prefer a different chart type?
3. Do you want to filter the data differently?"

## QUERY INTERPRETATION GUIDELINES

### CLEAR REQUESTS - Proceed with data analysis when:
- User explicitly asks for a specific chart type: "create a bar chart of X"
- User clearly requests data: "show me", "find", "get", "query", "list"
- User asks for metrics: "how many", "what's the average", "calculate"
- User wants to analyze trends: "over time", "trend", "growth"

### AMBIGUOUS REQUESTS - Ask for clarification when:
- User's request lacks specific metrics or dimensions ("add more data points")
- User uses vague terms ("weird things", "interesting patterns", "anomalies")
- User asks to modify a chart without specifying how ("make it better")
- User's request contradicts available data structure
- User refers to metrics or dimensions not available in the schema

### HANDLING FOLLOW-UP REQUESTS
- Connect new requests to previous context and visualizations
- If user refers to "more" or "additional" without specifics, ask what aspect they want to expand:
  * More categories/dimensions? (e.g., additional product categories)
  * More metrics? (e.g., adding profit alongside revenue)
  * More time periods? (e.g., extending the date range)
  * More granular data? (e.g., breaking weekly data into daily)

### ANOMALY DETECTION REQUESTS
When users ask about "weird", "unusual", or "anomalies":
1. CLARIFY if not specific: "Would you like me to look for outliers, unexpected patterns, or inconsistencies in a particular area?"
2. SUGGEST specific anomaly checks:
   - Outlier values (extremely high/low)
   - Unexpected null values or gaps
   - Unusual relationships between variables
   - Seasonal patterns or trend breaks
   - Statistical anomalies (values > 2 standard deviations)

## STEP 2: ACTION
Based on your intent analysis:
1. For CLEAR DATA REQUESTS: Use the DataVisAgent tool
2. For CLEAR CONCEPTUAL QUESTIONS: Provide direct explanation
3. For AMBIGUOUS REQUESTS: Ask a clarifying question with 2-3 specific options

Remember: Keep responses concise and focused. Always prioritize addressing exactly what the user asked for.`;
}
