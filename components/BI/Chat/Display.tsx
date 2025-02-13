"use client";

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

interface DisplayProps {
  data: Record<string, any>[];
  sql: string;
  columns: string[];
}

export function Display({ data, sql, columns }: DisplayProps) {
  return (
    <div className="w-full max-w-2xl mx-auto bg-card rounded-xl border shadow-sm">
      <Tabs defaultValue="data" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="data" className="flex gap-2 text-xs">
            <Database className="h-3 w-3" />
            Data
          </TabsTrigger>
          <TabsTrigger value="chart" className="flex gap-2 text-xs">
            <BarChart3 className="h-3 w-3" />
            Chart
          </TabsTrigger>
          <TabsTrigger value="sql" className="flex gap-2 text-xs">
            <Code className="h-3 w-3" />
            SQL
          </TabsTrigger>
        </TabsList>

        <TabsContent value="data">
          <ScrollArea className="h-[200px] rounded-b-md border-x border-b">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead key={column} className="text-xs">
                      {column}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, i) => (
                  <TableRow key={i}>
                    {columns.map((column) => (
                      <TableCell
                        key={`${i}-${column}`}
                        className="text-xs py-2"
                      >
                        {row[column]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="chart">
          <div className="h-[200px] flex items-center justify-center border-x border-b rounded-b-md bg-muted/50">
            <p className="text-muted-foreground text-xs">
              Chart will be rendered here
            </p>
          </div>
        </TabsContent>

        <TabsContent value="sql">
          <ScrollArea className="h-[200px] rounded-b-md border-x border-b">
            <pre className="p-3 text-xs">
              <code>{sql}</code>
            </pre>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
