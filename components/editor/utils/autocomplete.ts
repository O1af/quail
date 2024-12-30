import { languages, IDisposable } from "monaco-editor";
import { DatabaseStructure } from "../../stores/table_store";

let previousDisposable: IDisposable | null = null;

export function setupSQLAutocomplete(
  monaco: typeof import("monaco-editor"),
  structure: DatabaseStructure
) {
  // Dispose of previous provider if it exists
  if (previousDisposable) {
    previousDisposable.dispose();
  }

  const keywords = [
    "ADD",
    "ADD CONSTRAINT",
    "ALL",
    "ALTER",
    "ALTER COLUMN",
    "ALTER TABLE",
    "AND",
    "ANY",
    "AS",
    "ASC",
    "BACKUP DATABASE",
    "BETWEEN",
    "CASE",
    "CHECK",
    "COLUMN",
    "CONSTRAINT",
    "CREATE",
    "CREATE DATABASE",
    "CREATE INDEX",
    "CREATE OR REPLACE VIEW",
    "CREATE TABLE",
    "CREATE PROCEDURE",
    "CREATE UNIQUE INDEX",
    "CREATE VIEW",
    "DATABASE",
    "DEFAULT",
    "DELETE",
    "DESC",
    "DISTINCT",
    "DROP",
    "DROP COLUMN",
    "DROP CONSTRAINT",
    "DROP DATABASE",
    "DROP DEFAULT",
    "DROP INDEX",
    "DROP TABLE",
    "DROP VIEW",
    "EXEC",
    "EXISTS",
    "FOREIGN KEY",
    "FROM",
    "FULL OUTER JOIN",
    "GROUP BY",
    "HAVING",
    "IN",
    "INDEX",
    "INNER JOIN",
    "INSERT INTO",
    "INSERT INTO SELECT",
    "IS NULL",
    "IS NOT NULL",
    "JOIN",
    "LEFT JOIN",
    "LIKE",
    "LIMIT",
    "NOT",
    "NOT NULL",
    "OR",
    "ORDER BY",
    "OUTER JOIN",
    "PRIMARY KEY",
    "PROCEDURE",
    "RIGHT JOIN",
    "ROWNUM",
    "SELECT",
    "SELECT DISTINCT",
    "SELECT INTO",
    "SELECT TOP",
    "SET",
    "TABLE",
    "TOP",
    "TRUNCATE TABLE",
    "UNION",
    "UNION ALL",
    "UNIQUE",
    "UPDATE",
    "VALUES",
    "VIEW",
    "WHERE",
  ];

  previousDisposable = monaco.languages.registerCompletionItemProvider("sql", {
    triggerCharacters: [" ", ".", "("],
    provideCompletionItems: (model, position) => {
      const wordUntilPosition = model.getWordUntilPosition(position);
      const word = wordUntilPosition.word;
      const lineContent = model.getLineContent(position.lineNumber);

      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: wordUntilPosition.startColumn,
        endColumn: wordUntilPosition.endColumn,
      };

      const suggestions: languages.CompletionItem[] = [];

      // Add keywords with better context awareness
      if (
        !lineContent.trim().includes(" ") ||
        lineContent.trim().endsWith(" ")
      ) {
        suggestions.push(
          ...keywords.map((keyword) => ({
            label: keyword,
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: keyword,
            range,
          }))
        );
      }

      // Add table names with better context awareness
      const isTableContext = /\b(from|join|update|into)\s+$/i.test(lineContent);
      if (isTableContext) {
        structure.schemas.forEach((schema) => {
          schema.tables.forEach((table) => {
            const fullName = `${schema.name}.${table.name}`;
            suggestions.push({
              label: fullName,
              kind: monaco.languages.CompletionItemKind.Class,
              insertText: fullName,
              documentation: `Table in schema ${schema.name}`,
              range,
            });
          });
        });
      }

      // Add column names with better context awareness
      const isColumnContext = /\b(select|where|on|by|having)\b/i.test(
        lineContent
      );
      if (isColumnContext) {
        const allColumns = new Set(
          structure.schemas.flatMap((schema) =>
            schema.tables.flatMap((table) =>
              table.columns.map((col) => ({
                name: col.name,
                type: col.dataType,
                table: table.name,
                schema: schema.name,
              }))
            )
          )
        );

        suggestions.push(
          ...Array.from(allColumns).map((col) => ({
            label: col.name,
            kind: monaco.languages.CompletionItemKind.Field,
            insertText: col.name,
            documentation: `Column from ${col.schema}.${col.table} (${col.type})`,
            range,
          }))
        );
      }

      return { suggestions };
    },
  });
}
