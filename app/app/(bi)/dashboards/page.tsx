"use client";

import { useState, useEffect } from "react";
import Fuse from "fuse.js";
import { createClient } from "@/utils/supabase/client";
import {
  loadUserDashboards,
  loadSharedDashboards,
  Dashboard,
} from "@/components/stores/dashboard_store";

// UI Components
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/header/dashboard-search-bar";
import { useHeader } from "@/components/header/header-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Icons
import {
  Grid,
  LayoutDashboard,
  List,
  Search,
  CirclePlus,
  Share2,
} from "lucide-react";

// Local components
import { EmptyState } from "@/app/app/(bi)/dashboards/components/EmptyState";
import { DashboardCard } from "./components/DashboardCard";
import { CreateDashboardDialog } from "./components/CreateDashboardDialog";

// Types
enum ViewMode {
  Grid = "grid",
  List = "list",
}

export default function DashboardsPage() {
  // State hooks
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Grid);
  const [searchQuery, setSearchQuery] = useState("");
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [sharedDashboards, setSharedDashboards] = useState<Dashboard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingShared, setIsLoadingShared] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { setHeaderContent, setHeaderButtons } = useHeader();
  const [activeTab, setActiveTab] = useState("my-dashboards");

  // Create dashboard dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const supabase = createClient();

  // Function to handle search updates
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Set up the search bar in the header
  useEffect(() => {
    setHeaderContent(
      <div className="flex flex-1 justify-between items-center w-full">
        <div>
          <h1 className="text-xl font-semibold">Dashboards</h1>
          <p className="text-sm text-muted-foreground">
            Manage and visualize your data
          </p>
        </div>
        <div className="w-full ml-4 max-w-lg mr-4">
          <SearchBar
            placeholder="Search dashboards..."
            value={searchQuery}
            onChange={handleSearch}
            debounceMs={300}
          />
        </div>
      </div>
    );

    setHeaderButtons(
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            setViewMode((prev) =>
              prev === ViewMode.Grid ? ViewMode.List : ViewMode.Grid
            )
          }
          title={viewMode === ViewMode.Grid ? "List view" : "Grid view"}
        >
          {viewMode === ViewMode.Grid ? (
            <List className="h-4 w-4" />
          ) : (
            <Grid className="h-4 w-4" />
          )}
        </Button>

        <Button onClick={() => setIsDialogOpen(true)}>
          <CirclePlus className="h-4 w-4 mr-2" />
          Create Dashboard
        </Button>
      </div>
    );

    return () => {
      // Clean up by resetting header when component unmounts
      setHeaderContent(null);
      setHeaderButtons(null);
    };
  }, [setHeaderContent, setHeaderButtons, searchQuery, viewMode]);

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
      fetchData();
      fetchSharedData();
    }
  }, [user]);

  // Refresh data function
  const fetchData = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const fetchedDashboards = await loadUserDashboards(user.id);
      setDashboards(fetchedDashboards);
    } catch (error) {
      console.error("Error refreshing dashboards:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch shared dashboards
  const fetchSharedData = async () => {
    if (!user?.email) return;

    setIsLoadingShared(true);
    try {
      const fetchedDashboards = await loadSharedDashboards(user.email);
      setSharedDashboards(fetchedDashboards);
    } catch (error) {
      console.error("Error refreshing shared dashboards:", error);
    } finally {
      setIsLoadingShared(false);
    }
  };

  // Filter dashboards based on search query
  const getFilteredDashboards = (dashboardList: Dashboard[]) => {
    if (searchQuery.trim() !== "") {
      const fuse = new Fuse(dashboardList, {
        keys: ["title", "description"],
        threshold: 0.5,
      });
      return fuse.search(searchQuery).map((res) => res.item);
    }
    return dashboardList;
  };

  const filteredDashboards = getFilteredDashboards(dashboards);
  const filteredSharedDashboards = getFilteredDashboards(sharedDashboards);

  // Handle dashboard duplication event
  useEffect(() => {
    const handleDashboardDuplicated = () => {
      fetchData();
      fetchSharedData();
    };

    // Subscribe to events from dashboard cards
    if (typeof window !== "undefined" && window.addEventListener) {
      window.addEventListener(
        "dashboard-duplicated",
        handleDashboardDuplicated
      );

      return () => {
        window.removeEventListener(
          "dashboard-duplicated",
          handleDashboardDuplicated
        );
      };
    }
  }, []);

  // Render the dashboard content based on loading state
  const renderDashboardContent = () => {
    if (isLoading) {
      return (
        <div className="flex w-full items-center justify-center py-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full border-4 border-gray-300 border-t-gray-900 h-12 w-12" />
            <p className="text-gray-500 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      );
    }

    // If there's a search query but no results found
    if (searchQuery.trim() !== "" && filteredDashboards.length === 0) {
      return (
        <EmptyState
          title="No results found"
          description={`No dashboards match your search for "${searchQuery}"`}
          actionText="Clear search"
          icon={<Search className="h-10 w-10 mb-2 text-muted-foreground" />}
          onAction={() => setSearchQuery("")}
        />
      );
    }

    // Display dashboards
    return dashboards.length > 0 && filteredDashboards.length > 0 ? (
      <div
        className={
          viewMode === ViewMode.Grid
            ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            : "space-y-3"
        }
      >
        {filteredDashboards.map((dashboard) => (
          <DashboardCard
            key={dashboard._id}
            dashboard={dashboard}
            viewMode={viewMode}
            onRefresh={fetchData}
          />
        ))}
      </div>
    ) : (
      <EmptyState
        title="No dashboards found"
        description="Create your first dashboard to analyze data visually."
        actionText="Create Dashboard"
        icon={
          <LayoutDashboard className="h-10 w-10 mb-2 text-muted-foreground" />
        }
        onAction={() => {
          setIsDialogOpen(true);
        }}
      />
    );
  };

  // Render the shared dashboard content based on loading state
  const renderSharedDashboardContent = () => {
    if (isLoadingShared) {
      return (
        <div className="flex w-full items-center justify-center py-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full border-4 border-gray-300 border-t-gray-900 h-12 w-12" />
            <p className="text-gray-500 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      );
    }

    // If there's a search query but no results found
    if (searchQuery.trim() !== "" && filteredSharedDashboards.length === 0) {
      return (
        <EmptyState
          title="No results found"
          description={`No shared dashboards match your search for "${searchQuery}"`}
          actionText="Clear search"
          icon={<Search className="h-10 w-10 mb-2 text-muted-foreground" />}
          onAction={() => setSearchQuery("")}
        />
      );
    }

    // Display shared dashboards
    return sharedDashboards.length > 0 &&
      filteredSharedDashboards.length > 0 ? (
      <div
        className={
          viewMode === ViewMode.Grid
            ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            : "space-y-3"
        }
      >
        {filteredSharedDashboards.map((dashboard) => (
          <DashboardCard
            key={dashboard._id}
            dashboard={dashboard}
            viewMode={viewMode}
            onRefresh={fetchSharedData}
            isShared={true}
          />
        ))}
      </div>
    ) : (
      <EmptyState
        title="No shared dashboards"
        description="Dashboards shared with you will appear here."
        icon={<Share2 className="h-10 w-10 mb-2 text-muted-foreground" />}
      />
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex-1">
        {/* Tabs for My Dashboards and Shared Dashboards */}
        <Tabs
          defaultValue="my-dashboards"
          value={activeTab}
          onValueChange={setActiveTab}
          className="mb-6"
        >
          <TabsList>
            <TabsTrigger value="my-dashboards">My Dashboards</TabsTrigger>
            <TabsTrigger value="shared-dashboards">
              Shared With Me
              {sharedDashboards.length > 0 && (
                <span className="ml-2 bg-primary/20 text-xs rounded-full px-2 py-0.5">
                  {sharedDashboards.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-dashboards" className="space-y-6">
            {renderDashboardContent()}
          </TabsContent>

          <TabsContent value="shared-dashboards" className="space-y-6">
            {renderSharedDashboardContent()}
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Dashboard Dialog */}
      <CreateDashboardDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onDashboardCreated={fetchData}
        userId={user?.id || ""}
      />
    </div>
  );
}
