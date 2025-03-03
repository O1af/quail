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
  // Use concise format (verbose=false) to reduce tokens
  return `Database Type: ${dbType}

Schema:
${formatDatabaseSchema(databaseStructure, false)}

Recent Conversation History:
${formatConversationHistory(messages)}

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

RETURN JUST THE FIXED SQL QUERY, NOTHING ELSE.`;
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
# TASK: Generate optimal Chart.js configuration for the following data

## USER INTENT
${formatConversationHistory(messages, 3)}

## QUERY EXECUTED
\`\`\`sql
${query}
\`\`\`

## RESULT
${data.rows.length} rows

## COLUMN DETAILS
${data.types.map((type) => `- ${type.colName}: ${type.jsType}`).join("\n")}

## LABEL GENERATION
- Choose a column with categorical data for labels
- If no categorical column, use the first column as labels

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
