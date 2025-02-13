"use client";

import {
  BarChart,
  Clock,
  Grid,
  List,
  LineChart,
  MoreVertical,
  PieChart,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DashboardPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex-1 space-y-4 p-4 pt-6">
        <div className="flex items-center justify-between">
          <Input
            placeholder="Search dashboards, notebooks, charts"
            className="max-w-[400px]"
          />
          <div className="flex items-center gap-2">
            <Button variant="outline">
              New <span className="sr-only">Create new item</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                setViewMode((prev) => (prev === "grid" ? "list" : "grid"))
              }
            >
              {viewMode === "grid" ? (
                <List className="h-4 w-4" />
              ) : (
                <Grid className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Types</TabsTrigger>
            <TabsTrigger value="dashboards">Dashboards</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="space-y-4">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-medium tracking-tight">
                  Dashboards
                </h2>
                <p className="text-sm text-muted-foreground">1 dashboard</p>
              </div>
              <div
                className={
                  viewMode === "grid"
                    ? "grid gap-4 md:grid-cols-2 lg:grid-cols-4"
                    : "space-y-2"
                }
              >
                <ChartCard
                  title="Chatbot App Dashboard"
                  type="Dashboard"
                  icon={Grid}
                  viewMode={viewMode}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-medium tracking-tight">
                  Your saved charts
                </h2>
                <p className="text-sm text-muted-foreground">11 charts</p>
              </div>
              <div
                className={
                  viewMode === "grid"
                    ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                    : "space-y-2"
                }
              >
                <ChartCard
                  title="Total Number of Users"
                  type="Single Value"
                  icon={LineChart}
                  viewMode={viewMode}
                />
                <ChartCard
                  title="Subscription Plans"
                  type="Pie"
                  icon={PieChart}
                  viewMode={viewMode}
                />
                <ChartCard
                  title="Monthly Recurring Revenue"
                  type="Area"
                  icon={BarChart}
                  viewMode={viewMode}
                />
                <ChartCard
                  title="Total Revenue Calculation"
                  type="Single Value"
                  icon={LineChart}
                  viewMode={viewMode}
                />
                <ChartCard
                  title="Retention Rate by User Signup"
                  type="Line"
                  icon={LineChart}
                  viewMode={viewMode}
                />
                <ChartCard
                  title="Percentage of Cancelled"
                  type="Single Value"
                  icon={LineChart}
                  viewMode={viewMode}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  type,
  icon: Icon,
  viewMode,
}: {
  title: string;
  type: string;
  icon: React.ComponentType<{ className?: string }>;
  viewMode: "grid" | "list";
}) {
  return viewMode === "grid" ? (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <Icon className="h-4 w-4" />
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Share</DropdownMenuItem>
            <DropdownMenuItem>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <div>{type}</div>
          <div>•</div>
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>Updated 1 minute ago</span>
          </div>
        </div>
      </CardContent>
    </Card>
  ) : (
    <div className="flex items-center justify-between p-3 border rounded-lg shadow-sm">
      <div className="flex items-center space-x-3">
        <Icon className="h-5 w-5" />
        <div>
          <h3 className="text-sm font-medium">{title}</h3>
          <p className="text-xs text-muted-foreground">{type}</p>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem>Share</DropdownMenuItem>
          <DropdownMenuItem>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
