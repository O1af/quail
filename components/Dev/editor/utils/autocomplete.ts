import { languages, IDisposable, IPosition, IRange } from "monaco-editor";
import { DatabaseStructure } from "@/components/stores/table_store";

const SQL_CONFIG = {
  keywords: [
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
  ],
  functions: [
    "COUNT",
    "MIN",
    "MAX",
    "AVG",
    "SUM",
    "UPPER",
    "LOWER",
    "SUBSTRING",
  ],
  contextRules: {
    afterSelect: ["FROM", "DISTINCT", "TOP"],
    afterFrom: [
      "WHERE",
      "INNER JOIN",
      "LEFT JOIN",
      "RIGHT JOIN",
      "FULL OUTER JOIN",
    ],
    afterWhere: [
      "AND",
      "OR",
      "IN",
      "LIKE",
      "BETWEEN",
      "IS NULL",
      "IS NOT NULL",
    ],
  },
  triggerCharacters: [" ", ".", "("],
};

let previousDisposable: IDisposable | null = null;

function getContextualSuggestions(
  word: string,
  lineContent: string,
  position: IPosition,
  range: IRange,
  monaco: typeof import("monaco-editor")
): languages.CompletionItem[] {
  const suggestions: languages.CompletionItem[] = [];
  const wordBeforePosition = lineContent
    .slice(0, position.column - 1)
    .trim()
    .split(/\s+/)
    .pop()
    ?.toUpperCase();

  // Add contextual keywords
  const contextKeywords =
    wordBeforePosition === "SELECT"
      ? SQL_CONFIG.contextRules.afterSelect
      : wordBeforePosition === "FROM"
      ? SQL_CONFIG.contextRules.afterFrom
      : wordBeforePosition === "WHERE"
      ? SQL_CONFIG.contextRules.afterWhere
      : SQL_CONFIG.keywords;

  const matchingKeywords = contextKeywords.filter((k) =>
    k.startsWith(word.toUpperCase())
  );

  return matchingKeywords.map((keyword) => ({
    label: keyword,
    kind: monaco.languages.CompletionItemKind.Keyword,
    insertText: keyword,
    range,
  }));
}

function getSchemaSuggestions(
  structure: DatabaseStructure,
  range: IRange,
  monaco: typeof import("monaco-editor")
): languages.CompletionItem[] {
  return structure.schemas.map((schema) => ({
    label: schema.name,
    kind: monaco.languages.CompletionItemKind.Module,
    insertText: schema.name,
    documentation: `Schema containing ${schema.tables.length} tables`,
    range,
  }));
}

function getDatabaseSuggestions(
  lineContent: string,
  structure: DatabaseStructure,
  range: IRange,
  monaco: typeof import("monaco-editor")
): languages.CompletionItem[] {
  const suggestions: languages.CompletionItem[] = [];

  // Always add schema and table suggestions
  structure.schemas.forEach((schema) => {
    schema.tables.forEach((table) => {
      const fullName = `${table.name}`;
      suggestions.push({
        label: fullName,
        kind: monaco.languages.CompletionItemKind.Class,
        insertText: fullName,
        documentation: `Table in schema ${schema.name}`,
        range,
      });
    });
  });

  // Add column suggestions
  if (/\b(select|where|on|by|having)\b/i.test(lineContent)) {
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

  return suggestions;
}

export function setupSQLAutocomplete(
  monaco: typeof import("monaco-editor"),
  structure: DatabaseStructure
) {
  if (previousDisposable) {
    previousDisposable.dispose();
  }

  previousDisposable = monaco.languages.registerCompletionItemProvider("sql", {
    triggerCharacters: SQL_CONFIG.triggerCharacters,
    provideCompletionItems: (model, position) => {
      const wordUntilPosition = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: wordUntilPosition.startColumn,
        endColumn: wordUntilPosition.endColumn,
      };

      const schemaSuggestions = getSchemaSuggestions(structure, range, monaco);
      const contextualSuggestions = getContextualSuggestions(
        wordUntilPosition.word,
        model.getLineContent(position.lineNumber),
        position,
        range,
        monaco
      );

      const databaseSuggestions = getDatabaseSuggestions(
        model.getLineContent(position.lineNumber),
        structure,
        range,
        monaco
      );

      const functionSuggestions = SQL_CONFIG.functions.map((fn) => ({
        label: fn,
        kind: monaco.languages.CompletionItemKind.Function,
        insertText: fn,
        range,
      }));

      return {
        suggestions: [
          ...schemaSuggestions,
          ...contextualSuggestions,
          ...databaseSuggestions,
          ...functionSuggestions,
        ],
      };
    },
  });
}
