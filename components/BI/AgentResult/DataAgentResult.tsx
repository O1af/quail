"use client";

import { ChartConfiguration } from "@/lib/types/BI/chart";
import { DynamicChart } from "./dynamic-chartjs";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BarChart3, Database, Code } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DataAgentResultProps {
  visualization?: ChartConfiguration;
  data?: any[];
  query?: string;
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-full text-muted-foreground">
      {message}
    </div>
  );
}

export function DataAgentResult({
  visualization,
  data,
  query,
}: DataAgentResultProps) {
  if (!visualization && !data && !query) return null;

  return (
    <Card className="w-[700px]">
      <Tabs defaultValue="chart" className="w-full">
        <TabsList className="w-full border-b rounded-none grid grid-cols-3">
          <TabsTrigger value="chart" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Chart
          </TabsTrigger>
          <TabsTrigger value="data" className="gap-2">
            <Database className="h-4 w-4" />
            Data
          </TabsTrigger>
          <TabsTrigger value="query" className="gap-2">
            <Code className="h-4 w-4" />
            Query
          </TabsTrigger>
        </TabsList>

        <div className="h-[500px] relative">
          {/* Chart Tab */}
          <TabsContent
            value="chart"
            className="absolute inset-0 data-[state=inactive]:hidden p-6"
          >
            {visualization ? (
              <div className="h-full w-full">
                <DynamicChart
                  config={visualization}
                  className="w-full h-full"
                />
              </div>
            ) : (
              <EmptyState message="No visualization available" />
            )}
          </TabsContent>
          {/* Data Tab */}
          <TabsContent
            value="data"
            className="absolute inset-0 data-[state=inactive]:hidden p-6"
          >
            {data && data.length > 0 ? (
              <div className="h-full flex flex-col">
                <ScrollArea className="flex-1 border rounded-md">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-10">
                      <TableRow>
                        {Object.keys(data[0]).map((key) => (
                          <TableHead key={key} className="whitespace-nowrap">
                            {key}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.map((row, i) => (
                        <TableRow key={i}>
                          {Object.values(row).map((value: any, j) => (
                            <TableCell
                              key={j}
                              className="truncate max-w-[200px]"
                              title={
                                typeof value === "object"
                                  ? JSON.stringify(value)
                                  : String(value)
                              }
                            >
                              {typeof value === "object"
                                ? JSON.stringify(value)
                                : String(value)}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
            ) : (
              <EmptyState message="No data available" />
            )}
          </TabsContent>
          {/* Query Tab */}
          <TabsContent
            value="query"
            className="absolute inset-0 data-[state=inactive]:hidden p-6"
          >
            {query ? (
              <ScrollArea className="h-full border rounded-md">
                <pre className="p-4 font-mono text-sm">
                  <code>{query}</code>
                </pre>
              </ScrollArea>
            ) : (
              <EmptyState message="No query available" />
            )}
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  );
}
