import { DatabaseStructure } from "@/components/stores/table_store";
import { Index, Column, Schema, Table } from "@/components/stores/table_store";
import { countTokens } from "gpt-tokenizer";
import { Message } from "ai";
import { formatConversationHistory, formatDatabaseSchema } from "./format";

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
${formatDatabaseSchema(databaseStructure)}

Recent Conversation History:
${formatConversationHistory(messages)}

# TASK: Generate a visualization-ready SQL query that directly answers the user's request

## CRITICAL REQUIREMENTS:
- ONLY use tables and columns that EXIST in the schema above
- ALWAYS include WHERE clauses to limit result size 
- ENSURE all column references have proper table qualification in JOINs
- VERIFY every column referenced exists in FROM/JOIN tables
- LIMIT results to maximum 50 rows for visualization
- USE correct ${dbType} syntax for date/string functions

## QUERY STRUCTURE:
- SELECT: Choose metrics (numeric) and dimensions (categorical) for visualization
- FROM/JOIN: Only join tables when necessary with explicit ON conditions
- WHERE: Focus on relevant time periods and filter conditions
- GROUP BY: Include for all non-aggregated SELECT columns
- HAVING: Use for filtering aggregated results
- ORDER BY: Sort by the most meaningful column
- LIMIT 50

## OPTIMIZATION FOR VISUALIZATION:
- Include 1-2 categorical columns (for x-axis/grouping) + 1-3 metrics (for y-axis)
- For time series: Use ${
    dbType === "postgres"
      ? "DATE_TRUNC"
      : dbType === "mysql"
      ? "DATE_FORMAT"
      : "TRUNC"
  } for appropriate intervals
- Round decimal values with ROUND() for readability
- Calculate percentages using NULLIF to prevent division by zero
- Filter NULL values that would affect calculations

## ERROR PREVENTION:
- Never reference non-existent tables or columns
- Never reference a column from a table not in FROM/JOIN
- Include all non-aggregated columns in GROUP BY
- Double check table and column names match schema exactly
- Views: Only use columns directly available in the view

RETURN ONLY THE SQL QUERY - NO EXPLANATION OR MARKDOWN`;
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
  return `# TASK: Fix the SQL query that returned an error

## DATABASE TYPE
${dbType}

## DATABASE SCHEMA
${formatDatabaseSchema(databaseStructure)}

## ORIGINAL QUERY
\`\`\`sql
${originalQuery}
\`\`\`

## ERROR MESSAGE
${errorMessage}

## COMMON ISSUES TO CHECK
- Missing or misspelled table/column names
- Column references not qualified with table name/alias in joins
- Aggregate functions without proper GROUP BY
- Non-aggregate columns missing from GROUP BY
- Incorrect data types in WHERE conditions
- Syntax errors specific to ${dbType}
- Tables referenced in query not available in schema
- Incorrect date format or string comparisons

## INSTRUCTIONS
1. Analyze the error message
2. Find and fix ALL issues in the query
3. Ensure query remains focused on same data intent
4. Verify all tables and columns exist in the schema
5. Return ONLY the corrected SQL query with no explanations

RETURN JUST THE FIXED SQL QUERY, NOTHING ELSE.`;
}

export function createChartPrompt({
  data,
  query,
  messages,
}: {
  data: any[];
  query: string;
  messages: Message[];
}): string {
  const tokenCount = countTokens(JSON.stringify(data));
  console.log("Token count for data:", tokenCount);
  return `
# TASK: Generate optimal Chart.js configuration for the following data

## USER INTENT
${formatConversationHistory(messages, 3)}

## QUERY EXECUTED
\`\`\`sql
${query}
\`\`\`

## DATA:
${data}

## CHART SELECTION DECISION TREE
- Time-based data + trend analysis → Line chart
- Categorical comparisons (< 10 categories) → Vertical bar chart
- Categorical comparisons (≥ 10 categories) → Horizontal bar chart
- Composition/percentage data (≤ 7 segments) → Pie/Doughnut chart
- Correlation between two variables → Scatter chart
- Multiple metrics across categories → Radar chart
- Single metric with target → Gauge chart

## CONFIGURATION REQUIREMENTS
- Title: Concise description answering user's question
- Axes: Clear labels describing the data measurements
- Colors: Use contrasting colors for categories
- Layout: Optimize for readability (responsive: true)
- Legend: Position for minimal overlap with data
- Tooltips: Show all relevant data points

## DATA TRANSFORMATIONS
- Numeric: Format large numbers for readability
- Dates: Format as human-readable strings
- Percentages: Show with % symbol
- Currency: Use appropriate symbols
- Nulls: Handle gracefully with fallbacks

RETURN ONLY A VALID CHART.JS CONFIGURATION OBJECT`;
}

export function createSystemPrompt(
  dbType: string,
  messages: Message[]
): string {
  return `You are an expert data analyst specializing in ${dbType} databases who helps users understand their data through visualizations and insights.

# WORKFLOW DECISION TREE
1. User asks question about DATA VISUALIZATION or ANALYSIS → Use dataAgent immediately
2. User asks for SQL QUERY or mentions DATABASE → Use dataAgent immediately
3. User asks FOLLOW-UP about previous visualization → Use dataAgent with reference to prior context
4. User wants CONCEPTUAL explanation about data/charts → Answer directly WITHOUT dataAgent
5. User has GENERAL question not about their data → Answer directly WITHOUT dataAgent

# WHEN USING DATAAGENT TOOL
- ALWAYS use for questions that need actual data to answer
- NEVER use for conceptual questions that don't require querying a database
- If user request is ambiguous, ask a SINGLE clarifying question before proceeding

# AFTER VISUALIZATION IS GENERATED
1. Point out 2-3 SPECIFIC insights from the data (trends, outliers, patterns)
2. Explain what the visualization reveals about the user's question
3. Suggest follow-up analysis if appropriate

# RESPONSE STRUCTURE
- Keep explanations concise (3-5 sentences maximum)
- Use bullet points for multiple insights
- Refer to specific data points by their values
- Don't repeat SQL syntax details unless asked

Remember: Your primary goal is to help users understand their data, not to explain how SQL or databases work.`;
}
