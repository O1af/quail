"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Fuse from "fuse.js";
import { createClient } from "@/utils/supabase/client";
import {
  loadUserDashboards,
  Dashboard,
} from "@/components/stores/dashboard_store";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Icons
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
  Pin,
  PinOff,
  Plus,
  Search,
  X,
} from "lucide-react";
import { CreateDashboard } from "@/components/header/create-dashboard";

// Types
type ViewMode = "grid" | "list";
type TabValue = "dashboards" | "charts" | "pinned";

// Sample chart data for demo purposes
const initialChartsData = [
  {
    title: "Total Number of Users",
    type: "Bar",
    icon: BarChart,
    link: "/mychart",
    pinned: false,
  },
  {
    title: "Subscription Plans",
    type: "Pie",
    icon: PieChart,
    link: "/mychart",
    pinned: false,
  },
  {
    title: "Monthly Recurring Revenue",
    type: "Area",
    icon: ChartArea,
    link: "/mychart",
    pinned: false,
  },
  {
    title: "Total Revenue Calculation",
    type: "Scatter",
    icon: ChartScatter,
    link: "/mychart",
    pinned: false,
  },
  {
    title: "Retention Rate by User Signup",
    type: "Line",
    icon: LineChart,
    link: "/mychart",
    pinned: false,
  },
  {
    title: "Percentage of Cancelled",
    type: "Single Value",
    icon: Gauge,
    link: "/mychart",
    pinned: false,
  },
  {
    title: "User Data",
    type: "Table",
    icon: FileSpreadsheet,
    link: "/mychart",
    pinned: false,
  },
];

// Search config for Fuse.js
const fuseOptions = {
  keys: [
    { name: "title", weight: 0.7 },
    { name: "type", weight: 0.3 },
  ],
  threshold: 0.3,
};

export default function DashboardPage({
  searchQuery: externalSearchQuery = "",
}) {
  // State hooks
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState(externalSearchQuery);
  const [selectedTab, setSelectedTab] = useState<TabValue>("dashboards");
  const [chartsData, setChartsData] = useState(initialChartsData);
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const supabase = createClient();

  // Listen for search events from the layout component
  useEffect(() => {
    const handleSearch = (event: Event) => {
      const customEvent = event as CustomEvent;
      setSearchQuery(customEvent.detail.query);
    };

    window.addEventListener("app:search", handleSearch);

    return () => {
      window.removeEventListener("app:search", handleSearch);
    };
  }, []);

  // Update internal search state when external search prop changes
  useEffect(() => {
    setSearchQuery(externalSearchQuery);
  }, [externalSearchQuery]);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = `${process.env.NEXT_PUBLIC_APP_URL}/login`;
        return;
      }

      setUser(user);
    };

    fetchUser();
  }, [supabase]);

  // Fetch dashboards when user is loaded
  useEffect(() => {
    if (user?.id) {
      const fetchDashboards = async () => {
        setIsLoading(true);
        try {
          const fetchedDashboards = await loadUserDashboards(
            user.id.toString()
          );
          setDashboards(fetchedDashboards);
        } catch (error) {
          console.error("Error loading dashboards:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchDashboards();
    }
  }, [user]);

  // Toggle pin status for a chart
  const togglePin = (title: string) => {
    setChartsData((prev) =>
      prev.map((chart) =>
        chart.title === title ? { ...chart, pinned: !chart.pinned } : chart
      )
    );
  };

  // Filter content based on selected tab and search query
  const getFilteredContent = () => {
    if (selectedTab === "dashboards") {
      // For dashboards tab, show dashboards from MongoDB
      // Apply search filter if query exists
      if (searchQuery.trim() !== "") {
        const fuse = new Fuse(dashboards, {
          keys: ["title"],
          threshold: 0.5,
        });
        return fuse.search(searchQuery).map((res) => res.item);
      }
      return dashboards;
    } else {
      // For other tabs, filter the charts data
      let filtered = chartsData;

      if (selectedTab === "charts") {
        filtered = chartsData.filter((chart) => chart.type !== "Dashboard");
      } else if (selectedTab === "pinned") {
        filtered = chartsData.filter((chart) => chart.pinned);
      }

      // Apply search filter if query exists
      if (searchQuery.trim() !== "") {
        const fuse = new Fuse(filtered, fuseOptions);
        return fuse.search(searchQuery).map((res) => res.item);
      }

      return filtered;
    }
  };

  const filteredContent = getFilteredContent();

  // Render the main content based on the selected tab and loading state
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex w-full items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full border-4 border-gray-300 border-t-gray-900 h-12 w-12" />
            <p className="text-gray-500 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      );
    }

    // If there's a search query but no results found
    if (searchQuery.trim() !== "" && filteredContent.length === 0) {
      return (
        <EmptyState
          title="No results found"
          description={`No ${selectedTab} match your search for "${searchQuery}"`}
          actionText="Clear search"
          icon={<Search className="h-10 w-10 mb-2 text-muted-foreground" />}
          onAction={() => setSearchQuery("")}
        />
      );
    }

    if (selectedTab === "dashboards") {
      return dashboards.length > 0 && filteredContent.length > 0 ? (
        <div
          className={
            viewMode === "grid"
              ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3"
              : "space-y-3"
          }
        >
          {filteredContent.map((dashboard) => {
            return (
              <DashboardCard
                key={dashboard._id}
                dashboard={dashboard}
                viewMode={viewMode}
              />
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No dashboards found"
          description="Create your first dashboard to analyze data visually."
          actionText="Create Dashboard"
          icon={
            <LayoutDashboard className="h-10 w-10 mb-2 text-muted-foreground" />
          }
        />
      );
    }

    return (
      <div
        className={
          viewMode === "grid"
            ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            : "space-y-3"
        }
      >
        {filteredContent.length > 0 ? (
          filteredContent.map((item) => {
            if ("_id" in item) {
              // This is a dashboard
              return (
                <DashboardCard
                  key={item._id.toString()}
                  dashboard={item as Dashboard}
                  viewMode={viewMode}
                />
              );
            } else {
              // This is a chart
              return (
                <ChartCard
                  key={item.title}
                  {...item}
                  viewMode={viewMode}
                  onPin={togglePin}
                />
              );
            }
          })
        ) : (
          <EmptyState
            title={`No ${
              selectedTab === "pinned" ? "pinned items" : "charts"
            } found`}
            description={
              selectedTab === "pinned"
                ? "Pin items to access them quickly."
                : "Create charts to visualize your data."
            }
            actionText={`Create ${
              selectedTab === "pinned" ? "Dashboard" : "Dashboard"
            }`}
            icon={
              selectedTab === "pinned" ? (
                <Pin className="h-10 w-10 mb-2 text-muted-foreground" />
              ) : (
                <BarChart className="h-10 w-10 mb-2 text-muted-foreground" />
              )
            }
          />
        )}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex-1 space-y-6">
        {/* Header with actions (search bar was moved to layout) */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Business Insights</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                setViewMode((prev) => (prev === "grid" ? "list" : "grid"))
              }
              title={viewMode === "grid" ? "List view" : "Grid view"}
            >
              {viewMode === "grid" ? (
                <List className="h-4 w-4" />
              ) : (
                <Grid className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Tabs for different content types */}
        <Tabs
          defaultValue="dashboards"
          className="space-y-6"
          onValueChange={(val) => setSelectedTab(val as TabValue)}
        >
          <TabsList>
            <TabsTrigger value="dashboards">Dashboards</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="pinned">Pinned</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="space-y-4">
            {renderContent()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Empty state component for when no items are found
function EmptyState({
  title,
  description,
  actionText,
  icon,
  onAction,
}: {
  title: string;
  description: string;
  actionText: string;
  icon: React.ReactNode;
  onAction?: () => void;
}) {
  return (
    <div className="text-center py-12 px-4 border-2 border-dashed rounded-lg col-span-full flex flex-col items-center justify-center">
      {icon}
      <h3 className="text-lg font-medium mt-2">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-md">
        {description}
      </p>
      <Button variant="outline" className="mt-6" onClick={onAction}>
        {actionText.includes("Clear") ? (
          <X className="mr-2 h-4 w-4" />
        ) : (
          <CreateDashboard />
        )}
        {actionText}
      </Button>
    </div>
  );
}

// Dashboard card component
function DashboardCard({
  dashboard,
  viewMode,
}: {
  dashboard: any;
  viewMode: ViewMode;
}) {
  // Format date to relative time (e.g., "2 days ago")
  const formatDate = (dateValue: string | Date) => {
    const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Calculate hours and minutes for same-day updates
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      const diffMinutes = Math.floor(diffTime / (1000 * 60));

      if (diffMinutes < 1) {
        return "just now";
      } else if (diffMinutes < 60) {
        return `${diffMinutes} ${diffMinutes === 1 ? "minute" : "minutes"} ago`;
      } else {
        return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
      }
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 30) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return viewMode === "grid" ? (
    <Link href={`/dashboard/${dashboard._id}`} className="group">
      <Card className="transition-all hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <LayoutDashboard className="h-4 w-4" />
            <CardTitle className="text-sm font-medium">
              {dashboard.title}
            </CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuItem>Share</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <div>
              {dashboard.charts?.length || 0} chart
              {dashboard.charts?.length !== 1 ? "s" : ""}
            </div>
            <div>•</div>
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>Updated {formatDate(dashboard.updatedAt)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  ) : (
    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/5 transition-colors">
      <Link href={`/dashboard/${dashboard._id}`} className="flex-1">
        <div className="flex items-center space-x-3">
          <LayoutDashboard className="h-5 w-5" />
          <div>
            <h3 className="text-sm font-medium">{dashboard.title}</h3>
            <p className="text-xs text-muted-foreground">
              {dashboard.charts?.length || 0} chart
              {dashboard.charts?.length !== 1 ? "s" : ""} • Updated{" "}
              {formatDate(dashboard.updatedAt)}
            </p>
          </div>
        </div>
      </Link>
      <div className="flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuItem>Share</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
  pinned,
  onPin,
}: {
  title: string;
  type: string;
  icon: React.ComponentType<{ className?: string }>;
  link: string;
  viewMode: ViewMode;
  pinned: boolean;
  onPin: (title: string) => void;
}) {
  return viewMode === "grid" ? (
    <Link href={link} className="group">
      <Card className="transition-all hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <Icon className="h-4 w-4" />
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.preventDefault();
                onPin(title);
              }}
              title={pinned ? "Unpin" : "Pin"}
            >
              {pinned ? (
                <Pin className="h-4 w-4 text-yellow-500" />
              ) : (
                <PinOff className="h-4 w-4" />
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                <DropdownMenuItem>Share</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <div>{type}</div>
            <div>•</div>
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>Updated recently</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  ) : (
    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/5 transition-colors">
      <Link href={link} className="flex-1">
        <div className="flex items-center space-x-3">
          <Icon className="h-5 w-5" />
          <div>
            <h3 className="text-sm font-medium">{title}</h3>
            <p className="text-xs text-muted-foreground">
              {type} • Updated recently
            </p>
          </div>
        </div>
      </Link>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            onPin(title);
          }}
          title={pinned ? "Unpin" : "Pin"}
        >
          {pinned ? (
            <Pin className="h-4 w-4 text-yellow-500" />
          ) : (
            <PinOff className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
