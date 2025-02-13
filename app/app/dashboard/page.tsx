"use client";

import {
  BarChart,
  ChartArea,
  Clock,
  FileSpreadsheet,
  Gauge,
  Grid,
  LayoutDashboard,
  List,
  LineChart,
  MoreVertical,
  PieChart,
  ChartScatter,
  CirclePlus,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import Fuse from "fuse.js";
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

const chartsData = [
  {
    title: "Chatbot App Dashboard",
    type: "Dashboard",
    icon: LayoutDashboard,
    link: "/dashboard/mydashboard",
  },
  {
    title: "Total Number of Users",
    type: "Bar",
    icon: BarChart,
    link: "/mychart",
  },
  {
    title: "Subscription Plans",
    type: "Pie",
    icon: PieChart,
    link: "/mychart",
  },
  {
    title: "Monthly Recurring Revenue",
    type: "Area",
    icon: ChartArea,
    link: "/mychart",
  },
  {
    title: "Total Revenue Calculation",
    type: "Scatter",
    icon: ChartScatter,
    link: "/mychart",
  },
  {
    title: "Retention Rate by User Signup",
    type: "Line",
    icon: LineChart,
    link: "/mychart",
  },
  {
    title: "Percentage of Cancelled",
    type: "Single Value",
    icon: Gauge,
    link: "/mychart",
  },
  {
    title: "User Data",
    type: "Table",
    icon: FileSpreadsheet,
    link: "/mychart",
  },
];

const fuseOptions = {
  keys: [
    { name: "title", weight: 0.7 },
    { name: "type", weight: 0.3 },
  ],
  threshold: 0.3,
};

export default function DashboardPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState<
    "all" | "dashboards" | "charts"
  >("all");

  // Step 1: Filter Data Based on Selected Tab
  const filteredByTab = chartsData.filter((chart) => {
    if (selectedTab === "dashboards") return chart.type === "Dashboard";
    if (selectedTab === "charts") return chart.type !== "Dashboard";
    return true; // Show all for "all"
  });

  // Step 2: Apply Search to Filtered Data
  const fuse = new Fuse(filteredByTab, fuseOptions);
  const finalFilteredCharts =
    searchQuery.trim() === ""
      ? filteredByTab
      : fuse.search(searchQuery).map((result) => result.item);

  console.log("Selected Tab:", selectedTab);
  console.log("Filtered Data:", filteredByTab);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex-1 space-y-4 p-4 pt-6">
        <div className="flex items-center justify-between">
          <Input
            placeholder="Search dashboards, notebooks, charts"
            className="max-w-[400px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <CirclePlus /> New
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

        <Tabs
          defaultValue="all"
          className="space-y-4"
          onValueChange={(val) =>
            setSelectedTab(val as "all" | "dashboards" | "charts")
          }
        >
          <TabsList>
            <TabsTrigger value="all">All Types</TabsTrigger>
            <TabsTrigger value="dashboards">Dashboards</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
          </TabsList>
          <TabsContent value={selectedTab} className="space-y-4">
            <div
              className={
                viewMode === "grid"
                  ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                  : "space-y-2"
              }
            >
              {finalFilteredCharts.map((chart) => (
                <ChartCard key={chart.title} {...chart} viewMode={viewMode} />
              ))}
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
  link,
  viewMode,
}: {
  title: string;
  type: string;
  icon: React.ComponentType<{ className?: string }>;
  link: string;
  viewMode: "grid" | "list";
}) {
  return viewMode === "grid" ? (
    <Link href={link}>
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
    </Link>
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
