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

function formatMessage(message: Message): string {
  const role = message.role.toUpperCase();
  // Handle parts array
  if (Array.isArray(message.parts)) {
    const formattedParts = message.parts
      .map((part) => {
        if (
          part.type === "tool-invocation" &&
          part.toolInvocation?.toolName === "dataAgent"
        ) {
          // Create a copy to avoid modifying the original
          const processedPart = JSON.parse(JSON.stringify(part));
          if (
            processedPart.toolInvocation.state === "result" &&
            processedPart.toolInvocation.result?.data
          ) {
            processedPart.toolInvocation.result.data = "[data]";
          }
          return JSON.stringify(processedPart);
        }
        return typeof part === "string" ? part : JSON.stringify(part);
      })
      .join("\n");

    return `${role}: ${formattedParts}`;
  }

  // Fallback for other content formats
  return `${role}: ${JSON.stringify(message.content)}`;
}

export function formatConversationHistory(
  messages: Message[],
  num = 10,
  includeRecent = true
): string {
  const recentMessages = optimizeMessages(messages.slice(-num), includeRecent);

  const formattedMessages = recentMessages.map((msg) => {
    const role = msg.role.toUpperCase();
    const formattedContent = formatMessage(msg);
    return `${role}: ${formattedContent}`;
  });

  return formattedMessages.join("\n\n");
}

export function optimizeMessages(
  messages: Message[],
  includeRecent = true
): Message[] {
  // Find the index of the most recent message with a dataAgent tool part
  const lastToolCallIndex = messages
    .slice()
    .reverse()
    .findIndex(
      (message) =>
        message.role === "assistant" &&
        Array.isArray(message.parts) &&
        message.parts.some(
          (part) =>
            part.type === "tool-invocation" &&
            part.toolInvocation?.toolName === "dataAgent"
        )
    );

  const mostRecentToolCallMessageIndex =
    lastToolCallIndex === -1 ? -1 : messages.length - 1 - lastToolCallIndex;

  return messages.map((message, index) => {
    // Always keep user messages unchanged
    if (message.role === "user") {
      return message;
    }

    // For assistant messages
    if (message.role === "assistant") {
      // Clone the message without toolInvocations
      const { toolInvocations, ...strippedMessage } = message;

      // If no parts array or not the kind we're processing, just return without toolInvocations
      if (!Array.isArray(message.parts)) {
        return strippedMessage;
      }

      // Process the parts array
      const processedParts = message.parts.map((part) => {
        // Only modify dataAgent tool parts
        if (
          part.type === "tool-invocation" &&
          part.toolInvocation?.toolName === "dataAgent"
        ) {
          // Is this from the most recent dataAgent message?
          const isLatestToolMessage = index === mostRecentToolCallMessageIndex;

          // Only keep the full data for the most recent tool call if includeRecent is true
          if (
            (!isLatestToolMessage || !includeRecent) &&
            part.toolInvocation.state === "result"
          ) {
            // Deep clone the part to avoid modifying the original
            const clonedPart = JSON.parse(JSON.stringify(part));
            // Replace the data field with placeholder
            clonedPart.toolInvocation.result.data =
              "[data removed to save tokens]";
            return clonedPart;
          }
        }
        // Return other parts unchanged
        return part;
      });

      // Return message with processed parts but without toolInvocations
      return {
        ...strippedMessage,
        parts: processedParts,
      };
    }

    // Default case - return the message without toolInvocations
    const { toolInvocations, ...rest } = message;
    return rest;
  });
}
