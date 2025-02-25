import { DatabaseStructure } from "@/components/stores/table_store";
import { Index, Column, Schema, Table } from "@/components/stores/table_store";
import { Message } from "ai";

export function formatDatabaseSchema(
  databaseStructure: DatabaseStructure
): string {
  const schemaContext = `
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
numeric: Decimal numbers\n\n`;

  const formattedSchema =
    schemaContext +
    databaseStructure.schemas
      .map((schema: Schema) => {
        const tableSummaries = schema.tables
          .map((table: Table) => {
            // Track foreign key relationships
            const relationships = table.columns
              .filter((col) => col.isForeignKey)
              .map(
                (col) =>
                  `RELATIONSHIP: ${table.name}.${col.name} -> ${col.referencedTable}.${col.referencedColumn}`
              )
              .join("\n");

            const columns = table.columns
              .map((col: Column) => {
                const constraints = [
                  col.isPrimary ? "PK" : "",
                  col.isUnique ? "UQ" : "",
                  col.isNullable === "NO" ? "NOT NULL" : "NULLABLE",
                  col.isForeignKey
                    ? `FK->${col.referencedTable}.${col.referencedColumn}`
                    : "",
                  col.columnDefault ? `DEFAULT=${col.columnDefault}` : "",
                ]
                  .filter(Boolean)
                  .join(", ");

                return `- ${col.name}:\n  Type: ${col.dataType}\n  Constraints: ${constraints}`;
              })
              .join("\n");

            const indexes = table.indexes
              ?.filter((idx) => !idx.isPrimary)
              .map(
                (idx: Index) =>
                  `- ${idx.isUnique ? "UNIQUE " : ""}${
                    idx.name
                  } ON (${idx.columns.join(",")})`
              )
              .join("\n");

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
        return `SCHEMA: ${schema.name}\n${"=".repeat(
          schema.name.length + 8
        )}\n\n${tableSummaries}`;
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
