"use client";

import { useState, useEffect } from "react";
import Fuse from "fuse.js";
import { createClient } from "@/utils/supabase/client";
import {
  loadUserDashboards,
  Dashboard,
  loadUserCharts,
  Chart,
} from "@/components/stores/dashboard_store";

// UI Components
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchBar } from "@/components/header/dashboard-search-bar";
import { useHeader } from "@/components/header/header-context";

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
import {
  DashboardCard,
  dashboardEvents,
} from "@/app/app/(bi)/insights/components/DashboardCard";
import {
  ChartCard,
  chartEvents,
} from "@/app/app/(bi)/insights/components/ChartCard";
import { ViewMode, TabValue } from "./types";

// Search config for Fuse.js
const fuseOptions = {
  keys: [
    { name: "title", weight: 0.7 },
    { name: "type", weight: 0.3 },
  ],
  threshold: 0.3,
};

export default function DashboardPage() {
  // State hooks
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState<TabValue>("dashboards");
  const [charts, setCharts] = useState<Chart[]>([]);
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [pinnedCharts, setPinnedCharts] = useState<Set<string>>(new Set());
  const { setHeaderContent } = useHeader();

  const supabase = createClient();

  // Function to handle search updates
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Set up the search bar in the header
  useEffect(() => {
    setHeaderContent(
      <SearchBar
        placeholder="Search insights..."
        value={searchQuery}
        onChange={handleSearch}
        className="w-full max-w-lg mx-auto"
        debounceMs={300}
      />
    );

    // Clean up when unmounting
    return () => setHeaderContent(null);
  }, [setHeaderContent, searchQuery]);

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

  // Fetch dashboards and charts when user is loaded
  useEffect(() => {
    if (user?.id) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          // Load both dashboards and charts in parallel
          const [fetchedDashboards, fetchedCharts] = await Promise.all([
            loadUserDashboards(user.id),
            loadUserCharts(user.id),
          ]);

          setDashboards(fetchedDashboards);
          setCharts(fetchedCharts);

          // Load pinned state from localStorage
          try {
            const savedPinned = localStorage.getItem(
              `pinned-charts-${user.id}`
            );
            if (savedPinned) {
              setPinnedCharts(new Set(JSON.parse(savedPinned)));
            }
          } catch (e) {
            console.error("Failed to load pinned charts from localStorage", e);
          }
        } catch (error) {
          console.error("Error loading data:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }
  }, [user]);

  // Add a function to refresh data when needed
  const refreshData = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      // Load both dashboards and charts in parallel
      const [fetchedDashboards, fetchedCharts] = await Promise.all([
        loadUserDashboards(user.id),
        loadUserCharts(user.id),
      ]);

      setDashboards(fetchedDashboards);
      setCharts(fetchedCharts);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle pin status for a chart
  const togglePin = (id: string) => {
    setPinnedCharts((prev) => {
      // Create new Set to maintain immutability
      const newSet = new Set(prev);

      // Toggle the presence of this ID
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }

      // Save to localStorage
      if (user?.id) {
        try {
          localStorage.setItem(
            `pinned-charts-${user.id}`,
            JSON.stringify([...newSet])
          );
        } catch (e) {
          console.error("Failed to save pinned charts to localStorage", e);
        }
      }

      return newSet;
    });
  };

  // Add a function to handle chart title updates
  const handleChartTitleChange = (chartId: string, newTitle: string) => {
    setCharts((prevCharts) =>
      prevCharts.map((chart) =>
        chart._id === chartId ? { ...chart, title: newTitle } : chart
      )
    );
  };

  // Pass the refreshData function to child components
  const handleDashboardCreatedOrDuplicated = () => {
    refreshData();
  };

  const handleChartCreatedOrDuplicated = (newChart?: Chart) => {
    if (newChart) {
      // If we have the new chart data, add it directly to state
      setCharts((prevCharts) => [...prevCharts, newChart]);
    } else {
      // Otherwise refresh all charts
      if (user?.id) {
        loadUserCharts(user.id).then((fetchedCharts) => {
          setCharts(fetchedCharts);
        });
      }
    }
  };

  // Filter content based on selected tab and search query
  const getFilteredContent = () => {
    if (selectedTab === "dashboards") {
      // For dashboards tab
      if (searchQuery.trim() !== "") {
        const fuse = new Fuse(dashboards, {
          keys: ["title", "description"],
          threshold: 0.5,
        });
        return fuse.search(searchQuery).map((res) => res.item);
      }
      return dashboards;
    } else if (selectedTab === "charts") {
      // For charts tab
      if (searchQuery.trim() !== "") {
        const fuse = new Fuse(charts, {
          keys: ["title", "type"],
          threshold: 0.5,
        });
        return fuse.search(searchQuery).map((res) => res.item);
      }
      return charts;
    } else {
      // For pinned tab
      const pinnedItems = charts.filter((chart) => pinnedCharts.has(chart._id));

      if (searchQuery.trim() !== "") {
        const fuse = new Fuse(pinnedItems, fuseOptions);
        return fuse.search(searchQuery).map((res) => res.item);
      }
      return pinnedItems;
    }
  };

  const filteredContent = getFilteredContent();

  // Set up event listeners for changes from child components
  useEffect(() => {
    // Listen for chart title changes
    const handleChartTitleChanged = ({
      id,
      title,
    }: {
      id: string;
      title: string;
    }) => {
      setCharts((prevCharts) =>
        prevCharts.map((chart) =>
          chart._id === id ? { ...chart, title } : chart
        )
      );
    };

    // Listen for chart duplication
    const handleChartDuplicated = (newChart: Chart) => {
      setCharts((prevCharts) => [...prevCharts, newChart]);
    };

    // Listen for dashboard duplication
    const handleDashboardDuplicated = (newDashboard: Dashboard) => {
      setDashboards((prevDashboards) => [...prevDashboards, newDashboard]);
    };

    // Subscribe to events
    chartEvents.on("chart-title-changed", handleChartTitleChanged);
    chartEvents.on("chart-duplicated", handleChartDuplicated);
    dashboardEvents.on("dashboard-duplicated", handleDashboardDuplicated);

    // Cleanup function
    return () => {
      chartEvents.off("chart-title-changed", handleChartTitleChanged);
      chartEvents.off("chart-duplicated", handleChartDuplicated);
      dashboardEvents.off("dashboard-duplicated", handleDashboardDuplicated);
    };
  }, []);

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

    // Dashboards tab
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

    // Charts or Pinned tabs
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
            return (
              <ChartCard
                key={item._id}
                id={item._id}
                title={item.title || "Untitled"}
                type={item?.visualization?.type || item?.type}
                link={`/chart/${item._id}`}
                updatedAt={item.updatedAt || new Date()}
                viewMode={viewMode}
                pinned={pinnedCharts.has(item._id)}
                onPin={() => togglePin(item._id)}
              />
            );
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
              selectedTab === "pinned" ? "Dashboard" : "Chart"
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
        {/* Header with actions (search bar was moved to layout header) */}
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
            <TabsTrigger value="dashboards">
              Dashboards {dashboards.length > 0 && `(${dashboards.length})`}
            </TabsTrigger>
            <TabsTrigger value="charts">
              Charts {charts.length > 0 && `(${charts.length})`}
            </TabsTrigger>
            <TabsTrigger value="pinned">
              Pinned {pinnedCharts.size > 0 && `(${pinnedCharts.size})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="space-y-4">
            {renderContent()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
