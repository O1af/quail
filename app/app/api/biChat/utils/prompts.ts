import { DatabaseStructure } from "@/components/stores/table_store";
import { Index, Column, Schema, Table } from "@/components/stores/table_store";
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

INSTRUCTIONS:
Generate a visualization-optimized SQL query following these rules:

FOCUS AND STRUCTURE:
- Directly answer the most recent user request, using prior context only if needed
- Start with SELECT and use only necessary columns
- Must include aggregations that make sense for visualization (COUNT, SUM, AVG)
- Always include GROUP BY except for single-value results
- Use ORDER BY on the most meaningful column
- Ensure result set size is reasonable for visualization
- Join tables only when necessary and always specify join conditions
- Use subqueries or CTEs for complex calculations
- Include HAVING clause when filtering aggregated results
- Add WHERE clauses to focus on relevant data ranges

DATA REQUIREMENTS:
- Include: 1-2 categorical columns (labels/groups) + 1-3 numeric columns (metrics)
- Time series: Use DATE_TRUNC for meaningful intervals
- Percentages: Normalize to 0-100 range
- Filter out outliers and irrelevant data
- For time data: Focus on relevant periods

SYNTAX (${dbType}):
- Tables: lowercase.unquoted, schema-prefixed (schema.table)
- Columns: Always "quoted" and table-prefixed (table."column")
- Aliases: lowercase, unquoted
- Double-quote any uppercase identifiers
- Reference only tables/columns from provided schema

RESPONSE FORMAT:
Return only the SQL query with no additional text, comments or markdown formatting.`;
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
  return `
Generate a Chart.js configuration to visualize this SQL data effectively.

Data Context:
${formatConversationHistory(messages)}

Query:
${query}

Sample Data:
${JSON.stringify(data.slice(0, 3), null, 2)}

Requirements:
1. Choose the most appropriate chart type:
   - Line: time series, trends
   - Bar: comparisons, categories
   - Pie/Doughnut: parts of whole (max 8 segments)
   - Scatter: correlations
   - Radar: multiple metrics

2. Configuration:
   - Use clear titles and labels
   - Enable responsiveness
   - Set appropriate scales
   - Use readable colors
   - Add helpful tooltips

Return a valid Chart.js configuration object only.`;
}

export function createSystemPrompt(
  dbType: string,
  messages: Message[]
): string {
  return `You are an expert data analyst and visualization specialist focused on ${dbType} databases.

Previous Conversation Context:
${formatConversationHistory(messages)}

Key Responsibilities:
- Help users explore and understand their data
- Suggest meaningful visualizations based on data patterns
- Explain complex data relationships in simple terms
- Guide users towards actionable insights

Tool Usage:
- Use the dataAgent tool whenever users request:
  * Data analysis or exploration
  * Visualizations or charts
  * SQL queries or data fetching
  * Statistical insights
- Don't use the tool for:
  * General conversation
  * Explaining concepts
  * Non-data questions
- Always analyze the tool's output and explain insights

Communication Style:
- Be clear and concise
- Use data-focused language
- Explain your visualization choices
- Point out interesting patterns or anomalies
- Ask clarifying questions when needed

Always consider:
- Data types and distributions
- Scale and context of numbers
- Time-series patterns where applicable
- Statistical significance
- Data quality and completeness
- Whether the current question requires data analysis`;
}
