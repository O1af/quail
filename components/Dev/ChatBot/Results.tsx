import { Config, Result } from "@/lib/types/chartTypes";
import { DynamicChart } from "./dynamic-chart";
import { SkeletonCard } from "./skeleton-card";
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCopyToClipboard } from "usehooks-ts";
import { useToast } from "@/hooks/use-toast";
import { useEditorStore } from "@/components/stores/editor_store";
import { Copy, Repeat } from "lucide-react";

export const Results = ({
  results,
  columns,
  sql,
  chartConfig,
}: {
  results: Result[];
  columns: string[];
  sql: string;
  chartConfig: Config | null;
}) => {
  const { toast } = useToast(); // Initialize the toast hook
  const { setValue } = useEditorStore();
  const [_, copyToClipboard] = useCopyToClipboard();

  const formatColumnTitle = (title: string) => {
    return title
      .split("_")
      .map((word, index) =>
        index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word
      )
      .join(" ");
  };

  const handleCopy = async () => {
    await copyToClipboard(sql);
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

  const formatCellValue = (column: string, value: any) => {
    if (
      typeof value === "number" &&
      column.toLowerCase().includes("valuation")
    ) {
      const formattedValue = value.toFixed(2).replace(/\.?0+$/, "");
      return `$${formattedValue}B`;
    }
    if (typeof value === "number" && column.toLowerCase().includes("rate")) {
      const percentage = (value * 100).toFixed(2);
      return `${percentage}%`;
    }
    if (value instanceof Date) {
      return value.toLocaleDateString();
    }
    return String(value || "");
  };

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
          `<span class='text-${color}-500 font-semibold'>${word}</span>`
        );
      });
    });

    return formattedSql;
  };

  return (
    <div className="flex-grow flex flex-col">
      <Tabs defaultValue="charts" className="w-full flex-grow flex flex-col">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger
            value="charts"
            disabled={
              Object.keys(results[0] || {}).length <= 1 || results.length < 2
            }
          >
            Chart
          </TabsTrigger>
          <TabsTrigger value="table">Table</TabsTrigger>
          <TabsTrigger value="sql">SQL</TabsTrigger>
        </TabsList>
        <TabsContent value="charts" className="flex-grow overflow-auto">
          <div className="mt-4">
            {chartConfig && results.length > 0 ? (
              <DynamicChart chartData={results} chartConfig={chartConfig} />
            ) : (
              <SkeletonCard />
            )}
          </div>
        </TabsContent>
        <TabsContent value="table" className="flex-grow">
          <div className="sm:min-h-[10px] relative">
            <Table className="min-w-full divide-y divide-border">
              <TableHeader className="bg-secondary sticky top-0 shadow-sm">
                <TableRow>
                  {columns.map((column, index) => (
                    <TableHead
                      key={index}
                      className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                    >
                      {formatColumnTitle(column)}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="bg-card divide-y divide-border">
                {results.map((row, index) => (
                  <TableRow key={index} className="hover:bg-muted">
                    {columns.map((column, cellIndex) => (
                      <TableCell
                        key={cellIndex}
                        className="px-6 py-4 whitespace-nowrap text-sm text-foreground"
                      >
                        {formatCellValue(column, row[column])}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        <TabsContent value="sql" className="flex-grow">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-md hover:bg-zinc-700 focus:outline-none"
                  onClick={() => insertCode(sql)}
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
          <div
            className="p-4 bg-secondary rounded-md text-sm whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: formatSqlWithHighlighting(sql) }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
