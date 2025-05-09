"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { memo, useMemo } from "react";

interface DataVisQueryProps {
  query?: string;
}

const EmptyState = memo(() => (
  <div className="flex items-center justify-center h-full text-muted-foreground">
    No query available
  </div>
));
EmptyState.displayName = "EmptyState";

export function DataVisQuery({ query }: DataVisQueryProps) {
  // Memoize the highlighted code to avoid unnecessary processing
  const highlightedCode = useMemo(() => {
    if (!query) return null;
    return highlightSql(query);
  }, [query]);

  if (!query) {
    return <EmptyState />;
  }

  return (
    <div className="h-full flex flex-col gap-2">
      <ScrollArea className="h-full border rounded-md relative">
        <div className="p-4 font-mono text-sm whitespace-pre-wrap break-words">
          <code dangerouslySetInnerHTML={{ __html: highlightedCode || "" }} />
        </div>
      </ScrollArea>
    </div>
  );
}

// Extract the SQL highlighting logic to a separate function
function highlightSql(sql: string) {
  // Define keyword categories with colors
  const keywords = {
    blue: [
      "SELECT",
      "FROM",
      "WHERE",
      "GROUP BY",
      "ORDER BY",
      "HAVING",
      "DISTINCT",
      "LIMIT",
      "OFFSET",
      "FETCH",
      "ASC",
      "DESC",
      "AS",
      "JOIN",
      "INNER JOIN",
      "LEFT JOIN",
      "RIGHT JOIN",
      "FULL JOIN",
      "ON",
    ],
    purple: [
      "COUNT",
      "SUM",
      "AVG",
      "MIN",
      "MAX",
      "LOWER",
      "UPPER",
      "ROUND",
      "LENGTH",
      "SUBSTRING",
      "TRIM",
      "REPLACE",
      "CONCAT",
      "COALESCE",
      "EXTRACT",
      "DATE_PART",
      "DATE_TRUNC",
    ],
    green: ["TRUE", "FALSE", "NULL"],
    yellow: ["INSERT", "UPDATE", "DELETE", "INTO", "VALUES", "SET"],
    red: [
      "AND",
      "OR",
      "NOT",
      "IN",
      "EXISTS",
      "LIKE",
      "BETWEEN",
      "CASE",
      "WHEN",
      "THEN",
      "ELSE",
      "END",
    ],
    cyan: ["CREATE", "DROP", "ALTER", "TABLE", "DATABASE", "INDEX", "VIEW"],
    pink: ["GRANT", "REVOKE", "COMMIT", "ROLLBACK", "SAVEPOINT"],
  };

  // Escape HTML to prevent XSS
  const escapeHtml = (text: string) => {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  };

  // First escape the SQL
  let formattedSql = escapeHtml(sql);

  // Apply highlighting only to complete words
  Object.entries(keywords).forEach(([color, words]) => {
    words.forEach((word) => {
      // Use word boundaries to match whole words only
      const wordPattern = new RegExp(`\\b(${word})\\b`, "gi");
      formattedSql = formattedSql.replace(
        wordPattern,
        `<span class='text-${color}-500 font-semibold'>$1</span>`
      );
    });
  });

  // Replace newlines with <br> tags
  return formattedSql.replace(/\n/g, "<br>");
}

// Export a memoized version of the component
export default memo(DataVisQuery);
