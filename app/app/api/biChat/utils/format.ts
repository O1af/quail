import { DatabaseStructure } from "@/components/stores/table_store";
import { Index, Column, Schema, Table } from "@/components/stores/table_store";
import { Message } from "ai";

export function formatDatabaseSchema(
  databaseStructure: DatabaseStructure,
  verbose = false
): string {
  // Concise version of schema header when not in verbose mode
  const schemaContext = verbose
    ? `
DATABASE OVERVIEW
================
This schema documentation is optimized for SQL query generation.

KEY CONCEPTS
-----------
PK: Primary Key (unique row identifier)
FK: Foreign Key (references another table's PK)
UQ: Unique constraint
IDX: Index (query optimization)
NOT NULL: Required field
DEFAULT: Fallback value

COMMON DATA TYPES
---------------
int: Whole numbers
varchar/text: Text data
timestamp: Date and time
boolean: True/false values
numeric: Decimal numbers\n\n`
    : `DATABASE SCHEMA\n==============\n\n`;

  const formattedSchema =
    schemaContext +
    databaseStructure.schemas
      .map((schema: Schema) => {
        const tableSummaries = schema.tables
          .map((table: Table) => {
            // In concise mode, skip tracking relationships separately
            const relationships = verbose
              ? table.columns
                  .filter((col) => col.isForeignKey)
                  .map(
                    (col) =>
                      `RELATIONSHIP: ${table.name}.${col.name} -> ${col.referencedTable}.${col.referencedColumn}`
                  )
                  .join("\n")
              : "";

            // More concise column formatting
            const columns = table.columns
              .map((col: Column) => {
                // Simplify constraints formatting
                const constraints = [
                  col.isPrimary ? "PK" : "",
                  col.isUnique && verbose ? "UQ" : "",
                  col.isNullable === "NO"
                    ? "NOT NULL"
                    : verbose
                    ? "NULLABLE"
                    : "",
                  col.isForeignKey
                    ? `FK->${col.referencedTable}.${col.referencedColumn}`
                    : "",
                  col.columnDefault && verbose
                    ? `DEFAULT=${col.columnDefault}`
                    : "",
                ]
                  .filter(Boolean)
                  .join(", ");

                return verbose
                  ? `- ${col.name}:\n  Type: ${col.dataType}\n  Constraints: ${constraints}`
                  : `- ${col.name} (${col.dataType})${
                      constraints ? ` [${constraints}]` : ""
                    }`;
              })
              .join("\n");

            // Simplify index information in concise mode
            const indexes =
              verbose && table.indexes?.length
                ? table.indexes
                    ?.filter((idx) => !idx.isPrimary)
                    .map(
                      (idx: Index) =>
                        `- ${idx.isUnique ? "UNIQUE " : ""}${
                          idx.name
                        } ON (${idx.columns.join(",")})`
                    )
                    .join("\n")
                : "";

            // Create a more concise table representation when not in verbose mode
            if (!verbose) {
              return `TABLE: ${table.name}\n${columns}\n`;
            }

            // Use original verbose format
            return (
              `TABLE: ${table.name}\n` +
              `=`.repeat(table.name.length + 7) +
              "\n" +
              `${table.comment ? `DESCRIPTION: ${table.comment}\n\n` : ""}` +
              `COLUMNS:\n${columns}\n\n` +
              `${indexes ? `INDEXES:\n${indexes}\n\n` : ""}` +
              `${relationships ? `RELATIONSHIPS:\n${relationships}\n\n` : ""}`
            );
          })
          .join("\n");

        // Simpler schema header in concise mode
        return verbose
          ? `SCHEMA: ${schema.name}\n${"=".repeat(
              schema.name.length + 8
            )}\n\n${tableSummaries}`
          : `SCHEMA: ${schema.name}\n${tableSummaries}`;
      })
      .join("\n\n");
  return formattedSchema;
}

function formatContent(content: string | Array<any>): string {
  if (typeof content === "string") {
    return content;
  }

  return content
    .map((part) => {
      switch (part.type) {
        case "text":
          return part.text;
        case "tool-call":
          return `[Tool Call: ${part.toolName}(${JSON.stringify(part.args)})]`;
        case "tool-result":
          // Extract only query and visualization config from tool results
          if (typeof part.result === "object" && part.result !== null) {
            const { query, visualization } = part.result;
            const formattedResult = {
              ...(query && { query }),
              ...(visualization && { visualization }),
            };
            return `[Tool Result${part.isError ? " (Error)" : ""}: ${
              part.toolName
            } → ${JSON.stringify(formattedResult, null, 2)}]`;
          }
          return `[Tool Result${part.isError ? " (Error)" : ""}: ${
            part.toolName
          } → ${String(part.result)}]`;
        default:
          return "";
      }
    })
    .join("\n");
}

export function formatConversationHistory(
  messages: Message[],
  num = 10
): string {
  const recentMessages = messages.slice(-num);

  const formattedMessages = recentMessages.map((msg) => {
    const role = msg.role.toUpperCase();
    const formattedContent = formatContent(msg.content);
    return `${role}: ${formattedContent}`;
  });

  return formattedMessages.join("\n\n");
}
