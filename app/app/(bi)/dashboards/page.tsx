"use client";

import { useState, useEffect, useMemo } from "react"; // Added useMemo
import Fuse from "fuse.js";
// Removed createClient import as it's not directly used here
import {
  loadUserDashboards,
  loadSharedDashboards,
  Dashboard,
} from "@/components/stores/dashboard_store";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import { useQuery, useQueryClient } from "@tanstack/react-query"; // Added React Query imports

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
  RefreshCw, // Added for potential error state action
} from "lucide-react";

// Local components
import { EmptyState } from "@/app/app/(bi)/dashboards/components/EmptyState";
import { DashboardCard } from "./components/DashboardCard";
import { CreateDashboardDialog } from "./components/CreateDashboardDialog";
import { ViewMode } from "./types"; // Import ViewMode from types.ts

export default function DashboardsPage() {
  // State hooks for UI
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Grid);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuthCheck({ redirectPath: "/login" });
  const { setHeaderContent, setHeaderButtons } = useHeader();
  const [activeTab, setActiveTab] = useState("my-dashboards");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // React Query Client
  const queryClient = useQueryClient();

  // --- React Query Data Fetching ---

  // Query for user's dashboards
  const userDashboardsQuery = useQuery({
    queryKey: ["userDashboards", user?.id],
    queryFn: () => {
      if (!user?.id) throw new Error("User ID not available");
      return loadUserDashboards(user.id);
    },
    enabled: !!user?.id, // Only run when user ID is available
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });

  // Query for dashboards shared with the user
  const sharedDashboardsQuery = useQuery({
    queryKey: ["sharedDashboards", user?.email],
    queryFn: () => {
      if (!user?.email) throw new Error("User email not available");
      return loadSharedDashboards(user.email);
    },
    enabled: !!user?.email, // Only run when user email is available
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });

  // --- Derived Data & Filtering ---

  // Memoize Fuse instances and filtered results
  const fuseOptions = {
    keys: ["title", "description"],
    threshold: 0.5,
  };

  const filteredDashboards = useMemo(() => {
    const dashboards = userDashboardsQuery.data ?? [];
    if (searchQuery.trim() === "") return dashboards;
    const fuse = new Fuse(dashboards, fuseOptions);
    return fuse.search(searchQuery).map((res) => res.item);
  }, [userDashboardsQuery.data, searchQuery]);

  const filteredSharedDashboards = useMemo(() => {
    const dashboards = sharedDashboardsQuery.data ?? [];
    if (searchQuery.trim() === "") return dashboards;
    const fuse = new Fuse(dashboards, fuseOptions);
    return fuse.search(searchQuery).map((res) => res.item);
  }, [sharedDashboardsQuery.data, searchQuery]);

  // --- Event Handlers & Effects ---

  // Function to handle search updates
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Set up the header content and buttons
  useEffect(() => {
    setHeaderContent(
      <div className="flex flex-1 justify-between items-center w-full gap-4">
        <h1 className="text-xl font-semibold">Dashboards</h1>
        <div className="w-full max-w-sm">
          {" "}
          {/* Adjusted max-width */}
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

        <Button onClick={() => setIsDialogOpen(true)} variant="outline">
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

  // --- Invalidate Queries ---

  // Invalidate queries function (used for refreshing)
  const invalidateUserDashboards = () => {
    queryClient.invalidateQueries({ queryKey: ["userDashboards", user?.id] });
  };

  const invalidateSharedDashboards = () => {
    queryClient.invalidateQueries({
      queryKey: ["sharedDashboards", user?.email],
    });
  };

  // Handle dashboard duplication event using query invalidation
  useEffect(() => {
    const handleDashboardDuplicated = () => {
      invalidateUserDashboards();
      invalidateSharedDashboards();
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
  }, [user?.id, user?.email]); // Add dependencies

  // --- Rendering Logic ---

  // Generic loading indicator
  const LoadingIndicator = () => (
    <div className="flex w-full items-center justify-center py-8">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full border-4 border-gray-300 border-t-gray-900 h-12 w-12" />
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );

  // Generic error state
  const ErrorIndicator = ({ onRetry }: { onRetry: () => void }) => (
    <EmptyState
      title="Failed to load dashboards"
      description="There was an error fetching the dashboards. Please try again."
      actionText="Retry"
      icon={<RefreshCw className="h-10 w-10 mb-2 text-destructive" />}
      onAction={onRetry}
    />
  );

  // Render the dashboard content based on query state
  const renderDashboardContent = () => {
    if (userDashboardsQuery.isLoading) return <LoadingIndicator />;
    if (userDashboardsQuery.isError)
      return <ErrorIndicator onRetry={invalidateUserDashboards} />;

    const dashboards = userDashboardsQuery.data ?? [];

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
            onRefresh={invalidateUserDashboards} // Use invalidation for refresh
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

  // Render the shared dashboard content based on query state
  const renderSharedDashboardContent = () => {
    if (sharedDashboardsQuery.isLoading) return <LoadingIndicator />;
    if (sharedDashboardsQuery.isError)
      return <ErrorIndicator onRetry={invalidateSharedDashboards} />;

    const dashboards = sharedDashboardsQuery.data ?? [];

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
    return dashboards.length > 0 && filteredSharedDashboards.length > 0 ? (
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
            onRefresh={invalidateSharedDashboards} // Use invalidation for refresh
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
    <div className="flex min-h-screen flex-col bg-background mx-auto px-4 py-8">
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
              {/* Use data from query for count */}
              {(sharedDashboardsQuery.data?.length ?? 0) > 0 && (
                <span className="ml-2 bg-primary/20 text-xs rounded-full px-2 py-0.5">
                  {sharedDashboardsQuery.data?.length}
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
        onDashboardCreated={invalidateUserDashboards} // Invalidate on creation
        userId={user?.id || ""}
      />
    </div>
  );
}
