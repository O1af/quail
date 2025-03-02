"use client";

import { useState, useEffect } from "react";
import Fuse from "fuse.js";
import { createClient } from "@/utils/supabase/client";
import {
  loadUserDashboards,
  Dashboard,
} from "@/components/stores/dashboard_store";

// UI Components
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Icons
import {
  BarChart,
  Grid,
  LayoutDashboard,
  List,
  Pin,
  Search,
} from "lucide-react";

// Local components
import { EmptyState } from "./components/EmptyState";
import { DashboardCard } from "@/app/app/(bi)/insights/components/DashboardCard";
import { ChartCard } from "@/app/app/(bi)/insights/components/ChartCard";
import { ViewMode, TabValue } from "./types";

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
  const [chartsData, setChartsData] = useState<any[]>([]);
  const [dashboards, setDashboards] = useState<any[]>([]);
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
