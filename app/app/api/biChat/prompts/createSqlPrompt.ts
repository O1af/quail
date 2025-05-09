import { DatabaseStructure } from "@/components/stores/table_store";
import { formatDatabaseSchema } from "../utils/format";

// Updated function for query validation with reasoning models
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
  return `# SQL QUERY CORRECTION TASK

## PROBLEM
SQL query failed with: "${errorMessage}"

## DATABASE
Type: ${dbType}
${formatDatabaseSchema(databaseStructure, false)}

## ORIGINAL QUERY
\`\`\`sql
${originalQuery}
\`\`\`

## FIX GUIDELINES
- Fix syntax issues for ${dbType} compatibility
- Use only tables and columns from the schema
- Properly qualify columns in joins (table.column)
- Include GROUP BY for non-aggregated columns
- If query returns no data:
  * Remove or broaden time filters
  * Replace strict equality (=) with LIKE/BETWEEN/IN
  * Remove secondary filter conditions

## RESPONSE FORMAT
Provide only the corrected SQL query with no explanation or markdown formatting.`;
}
