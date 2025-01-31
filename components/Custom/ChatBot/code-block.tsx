"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Repeat } from "lucide-react";
import { useCopyToClipboard } from "usehooks-ts";
import { useToast } from "@/hooks/use-toast";
import { useEditorStore } from "@/components/stores/editor_store";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const sqlRegex =
  /^(SELECT|INSERT|UPDATE|DELETE|MERGE|REPLACE|CREATE|DROP|ALTER|TRUNCATE|GRANT|REVOKE|COMMIT|ROLLBACK|SAVEPOINT|SET|SHOW|DESCRIBE|EXPLAIN|USE|LOCK|UNLOCK|TRUNCATE|BEGIN|END|CALL|EXCEPT|INTERSECT|FETCH)\s+/i;

interface CodeBlockProps {
  node: any;
  inline: boolean;
  className: string;
  children: any;
}

export function CodeBlock({
  node,
  inline,
  className,
  children,
  ...props
}: CodeBlockProps) {
  const [output, setOutput] = useState<string | null>(null);
  const [tab, setTab] = useState<"code" | "run">("code");
  const [_, copyToClipboard] = useCopyToClipboard();
  const { toast } = useToast();
  const { setValue } = useEditorStore();

  const formatSqlWithHighlighting = (sql: string) => {
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
      orange: ["'active'", "'inactive'", "'pending'"],
    };

    let formattedSql = sql;
    Object.entries(keywords).forEach(([color, words]) => {
      words.forEach((word) => {
        const regex = new RegExp(`\\b${word}\\b`, "gi");
        formattedSql = formattedSql.replace(
          regex,
          `<span class='text-${color}-500 font-semibold'>${word}</span>`,
        );
      });
    });

    return formattedSql;
  };

  const isSQL = sqlRegex.test(children);
  const highlightedCode = isSQL
    ? formatSqlWithHighlighting(children)
    : children;

  const handleCopy = async () => {
    await copyToClipboard(children);
    toast({
      description: "Copied to clipboard!",
      duration: 1750,
    });
  };

  const insertCode = (children: React.ReactNode) => {
    const newValue = `${children}`;
    setValue(newValue);
    toast({
      description: "Editor content replaced!",
      duration: 1750,
    });
  };

  if (!inline) {
    return (
      <>
        {tab === "code" && isSQL ? (
          <div className="not-prose flex flex-col relative">
            <div className="absolute top-0 left-0 right-0 flex justify-end bg-zinc-100 dark:bg-zinc-800 rounded-t-xl border-b border-zinc-200 dark:border-zinc-700">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-md hover:bg-zinc-700 focus:outline-none"
                      onClick={() => insertCode(children)}
                    >
                      <Repeat className="h-4 w-4 text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Insert code into editor</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-md hover:bg-zinc-700 focus:outline-none"
                      onClick={handleCopy}
                    >
                      <Copy className="h-4 w-4 text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <pre
              {...props}
              className={`text-sm w-full overflow-x-auto dark:bg-zinc-900 p-4 pt-12 border border-zinc-200 dark:border-zinc-700 rounded-xl dark:text-zinc-50 text-zinc-900`}
            >
              <code
                className="whitespace-pre-wrap break-words"
                dangerouslySetInnerHTML={{ __html: highlightedCode }}
              />
            </pre>
          </div>
        ) : (
          <>
            <code className="contents not-prose whitespace-pre-wrap break-words">
              {children}
            </code>
          </>
        )}
      </>
    );
  } else {
    return (
      <code
        className={`${className} text-sm bg-zinc-100 dark:bg-zinc-800 py-0.5 px-1 rounded-md`}
        {...props}
      >
        {children}
      </code>
    );
  }
}
