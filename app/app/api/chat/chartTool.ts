import { generateText, generateObject, tool, Message } from "ai";
import { z } from "zod";
import { createAzure } from "@ai-sdk/azure";
import { executeQuery } from "@/components/stores/utils/query";
import { Result, configSchema } from "@/lib/types/rechartTypes";
import { countTokens } from "gpt-tokenizer";
import {
  updateTokenUsage,
  getCurrentUsageColumn,
  getModelName,
} from "@/utils/metrics/AI";

const azure = createAzure({
  resourceName: process.env.NEXT_PUBLIC_AZURE_RESOURCE_NAME,
  apiKey: process.env.NEXT_PUBLIC_AZURE_API_KEY,
});

interface ChartToolParams {
  userTier: string;
  supabase: any;
  user: any;
  messages: Message[];
  formattedSchemas: string;
  dbType: string;
  connectionString: string;
  updatePromises: Promise<void>[];
}

function extractTableNames(schemaString: string): Map<string, string> {
  const tableMap = new Map<string, string>();
  // Look for "Table <tableName>" in the schema text.
  const matches = schemaString.matchAll(/Table\s+(\w+)/g);
  for (const match of matches) {
    const tableName = match[1];
    tableMap.set(tableName.toLowerCase(), tableName);
  }
  return tableMap;
}

function validateSQL(
  query: string,
  schemaStr: string
): { isValid: boolean; error?: string } {
  const normalizedQuery = query.trim().toLowerCase();
  const tableNames = extractTableNames(schemaStr);

  if (normalizedQuery.match(/drop|truncate|delete|update/)) {
    return {
      isValid: false,
      error: "Only SELECT queries are allowed for visualization",
    };
  }

  if (!normalizedQuery.startsWith("select")) {
    return { isValid: false, error: "Query must start with SELECT" };
  }

  // Check that all column references in the SELECT clause are table-qualified.
  const selectClause = normalizedQuery
    .split("from")[0]
    .replace("select", "")
    .trim();
  if (selectClause.match(/(?<!\.)\b[a-z_][a-z0-9_]*\b(?!\s*\()/)) {
    return {
      isValid: false,
      error: "All column references must be table-qualified to avoid ambiguity",
    };
  }

  // Validate that table references (FROM and JOIN clauses) match those in the schema.
  const tableRefs = [
    ...normalizedQuery.matchAll(
      /(?:from|join)\s+((?:\w+\.)?)(?:"?)(\w+)(?:"?)/gi
    ),
  ];
  for (const ref of tableRefs) {
    const tableName = ref[2].toLowerCase();
    if (!tableNames.has(tableName)) {
      return {
        isValid: false,
        error: `Table "${tableName}" not found in schema`,
      };
    }
  }

  return { isValid: true };
}

function generateSchemaString(data: Result[]): string {
  if (!Array.isArray(data) || data.length === 0)
    return "No data available to infer schema.";

  const schemaEntries = Object.entries(data[0]).map(
    ([key, value]) =>
      `  "${key}" ${typeof value === "number" ? "INTEGER" : "VARCHAR"}`
  );

  return `Schema: InferredTable

Table: GeneratedSchema
${schemaEntries.join(",\n")};`;
}

function formatConversationHistory(messages: Message[]): string {
  return messages
    .map((msg: Message) => {
      const role = msg.role.charAt(0).toUpperCase() + msg.role.slice(1);
      let messageText = `[${role}]: ${msg.content}`;

      if (msg.toolInvocations?.length) {
        const toolCalls = msg.toolInvocations
          .map((invocation) => {
            if (invocation.state === "result") {
              return `→ Result (${
                invocation.toolName
              }):\n  Config: ${JSON.stringify(
                invocation.result.config,
                null,
                2
              )}\n  SQL: ${invocation.result.sql}`;
            }
            return `→ Call (${invocation.toolName}):\n  Args: ${JSON.stringify(
              invocation.args,
              null,
              2
            )}`;
          })
          .join("\n");
        messageText += "\n" + toolCalls;
      }
      return messageText;
    })
    .join("\n---\n");
}

export const chartTool = (params: ChartToolParams) =>
  tool({
    description: "Generate a chart based on a user query.",
    parameters: z.object({}),
    execute: async () => {
      const jsonQuery = params.messages[params.messages.length - 1].content;
      const conversationHistory = formatConversationHistory(params.messages);

      // The SQL prompt now emphasizes the schema formatting details.
      const sqlPrompt = `
Database Type: ${params.dbType}

Formatted Database Schema:
${params.formattedSchemas}

Note: The schema above is generated with detailed context including table names, column names, and constraints (e.g., PK, FK). You MUST use only the table and column names exactly as shown.

Conversation History:
${conversationHistory}

User Request:
${jsonQuery}

INSTRUCTIONS:
1. The SQL query MUST start with the keyword SELECT.
2. The query MUST be designed for data visualization, typically using aggregation.
3. ONLY reference tables and columns explicitly defined in the provided schema.
4. Table names in PostgreSQL MUST be in lowercase.
5. Any identifier containing uppercase letters MUST be enclosed in double quotes.
6. ALL column names MUST be enclosed in double quotes.
7. Do NOT quote table names unless they contain uppercase letters.
8. Table aliases, if used, MUST be in lowercase and unquoted.
9. Schema names MUST be in lowercase and unquoted.
10. Prefix all table names with their schema name (e.g., schema_name.table_name).
11. Fully qualify every column reference with its table name or alias (e.g., table_name."column_name" or alias."column_name").
12. Do NOT reference any tables or columns not included in the schema.
13. Ensure the query returns at least one categorical column (for grouping or x-axis) and one or more quantitative columns (for y-axis), using aggregation functions (e.g., COUNT, SUM, AVG) as needed.
14. When joining tables, verify that the join columns exist in both tables as defined in the schema.
15. Do NOT include any markdown, code blocks, backticks, explanations, or comments.
16. Output MUST be a single, valid SQL query with no extra text.

Output only the SQL query.
      `.trim();

      try {
        const result = await generateText({
          model: azure(getModelName(params.userTier)),
          system:
            "You are an expert SQL developer specializing in data visualization queries. Generate only the SQL query, ensuring that every table and column reference exactly matches the provided schema context.",
          prompt: sqlPrompt,
        });

        const response = await executeQuery(
          result.text,
          params.connectionString,
          params.dbType
        );
        const results = response.rows.map((row) =>
          Object.fromEntries(
            Object.entries(row).map(([k, v]) => [
              k,
              isNaN(Number(v)) ? String(v) : parseFloat(String(v)),
            ])
          )
        ) as Result[];

        // Chart configuration prompt with explicit data type guidelines.
        const configPrompt = `
You are a data visualization expert.
Using the SQL query result data provided, generate a chart configuration that best visualizes the data and answers the user's query.
Ensure that:
- The x-axis (or category) field is based on categorical data (e.g., strings, dates) and the y-axis fields are based on quantitative (numeric) data.
- For a pie chart, select one categorical field paired with one quantitative field.
- For bar, line, or area charts, the x-axis should represent categories or a time dimension and the y-axis should use aggregated quantitative values.
- If the data contains multiple groups, use multi-line charts and clearly distinguish between each group.
- Field names in the configuration must exactly match those in the SQL result.
- The configuration follows best practices for chart visualization.
User Query:
${jsonQuery}

Inferred Database Schema:
${generateSchemaString(results)}

Output the chart configuration as valid JSON with no extra text.
        `.trim();

        const { object: config } = await generateObject({
          model: azure(getModelName(params.userTier)),
          system: "You are a data visualization expert.",
          prompt: configPrompt,
          schema: configSchema,
        });

        if (!config) throw new Error("Failed to generate chart configuration");

        const colors = Object.fromEntries(
          config.yKeys.map((key, i) => [key, `hsl(var(--chart-${i + 1}))`])
        );

        // Update token usage.
        params.updatePromises.push(
          updateTokenUsage(
            params.supabase,
            params.user.user.id,
            getCurrentUsageColumn(),
            countTokens(sqlPrompt) +
              countTokens(result.text) +
              countTokens(JSON.stringify(config)),
            params.userTier
          ).catch(console.error)
        );

        return { results, sql: result.text, config: { ...config, colors } };
      } catch (error) {
        console.error("Chart generation error:", error);
        return {
          error:
            error instanceof Error ? error.message : "Failed to generate chart",
          results: [],
          sql: "",
          config: null,
        };
      }
    },
  });
