import { generateText, generateObject, tool, Message } from "ai";
import { z } from "zod";
import { createAzure } from "@ai-sdk/azure";
import { executeQuery } from "@/components/stores/utils/query";
import { Result, configSchema } from "@/lib/types";
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
  const matches = schemaString.matchAll(/Table\s+(\w+)\s+contains columns:/g);
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

  const tableRefs = [
    ...normalizedQuery.matchAll(/from\s+"([^"]+)"|join\s+"([^"]+)"/gi),
  ];
  for (const ref of tableRefs) {
    const tableName = (ref[1] || ref[2]).toLowerCase();
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

  return `Schema: InferredTable\n\nTable: GeneratedSchema\n${schemaEntries.join(
    ",\n"
  )};`;
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
    description: "Generate a chart.",
    parameters: z.object({}),
    execute: async () => {
      const jsonQuery = params.messages[params.messages.length - 1].content;
      const conversationHistory = formatConversationHistory(params.messages);
      console.log("Conversation history:", conversationHistory);

      const sqlPrompt = `The database(${params.dbType}) schema is as follows: ${params.formattedSchemas}. 
        Previous conversation context:\n${conversationHistory}
        Based on this schema and conversation context, generate an SQL query to fulfill the following request: ${jsonQuery}.
        
        IMPORTANT RULES:
        1. ONLY use tables and columns that are explicitly defined in the schema above
        2. Tables must be referenced in lowercase in PostgreSQL
        3. Example format: SELECT "DNAME", "EMPNO" FROM dept WHERE "DEPTNO" = 10
        4. Table names should NOT be quoted, but column names must be quoted
        5. Table aliases are optional but if used should also be lowercase
        6. DO NOT use any columns or tables that aren't in the schema
        
        Output only valid SQL code as plain text, without any formatting or comments.`;

      try {
        const result = await generateText({
          model: azure(getModelName(params.userTier)),
          system:
            "You are an SQL expert focusing on data visualization queries.",
          prompt: sqlPrompt,
        });

        const validation = validateSQL(result.text, params.formattedSchemas);
        if (!validation.isValid) {
          return {
            error: validation.error,
            results: [],
            sql: result.text,
            config: null,
          };
        }

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

        const { object: config } = await generateObject({
          model: azure(getModelName(params.userTier)),
          system: "You are a data visualization expert.",
          prompt: `Given the following data from a SQL query result, generate the chart config that best visualises the data and answers the users query. For multiple groups use multi-lines. Match the field names in the results exactly.
            User Query: ${jsonQuery}
            Database Schema: ${generateSchemaString(results)}`,
          schema: configSchema,
        });

        if (!config) throw new Error("Failed to generate chart configuration");

        const colors = Object.fromEntries(
          config.yKeys.map((key, i) => [key, `hsl(var(--chart-${i + 1}))`])
        );

        // Handle token updates
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
