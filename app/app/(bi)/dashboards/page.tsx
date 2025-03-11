"use client";

import { useState, useEffect } from "react";
import Fuse from "fuse.js";
import { createClient } from "@/utils/supabase/client";
import { loadUserDashboards, Dashboard } from "@/components/stores/dashboard_store";

// UI Components
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchBar } from "@/components/header/dashboard-search-bar";
import { useHeader } from "@/components/header/header-context";

// Icons
import {
  Grid,
  LayoutDashboard,
  List,
  Search,
  Plus
} from "lucide-react";

// Local components
import { EmptyState } from "./components/EmptyState";
import { DashboardCard } from "./components/DashboardCard";

// Types
enum ViewMode {
  Grid = "grid",
  List = "list"
}

export default function DashboardsPage() {
  // State hooks
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Grid);
  const [searchQuery, setSearchQuery] = useState("");
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
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
        placeholder="Search dashboards..."
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

  // Fetch dashboards when user is loaded
  useEffect(() => {
    if (user?.id) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const fetchedDashboards = await loadUserDashboards(user.id);
          setDashboards(fetchedDashboards);
        } catch (error) {
          console.error("Error loading dashboards:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }
  }, [user]);

  // Refresh data function
  const refreshData = async () => {
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

  // Filter dashboards based on search query
  const getFilteredDashboards = () => {
    if (searchQuery.trim() !== "") {
      const fuse = new Fuse(dashboards, {
        keys: ["title", "description"],
        threshold: 0.5,
      });
      return fuse.search(searchQuery).map((res) => res.item);
    }
    return dashboards;
  };

  const filteredDashboards = getFilteredDashboards();

  // Handle dashboard duplication event
  useEffect(() => {
    const handleDashboardDuplicated = () => {
      refreshData();
    };

    // Subscribe to events from dashboard cards
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('dashboard-duplicated', handleDashboardDuplicated);
      
      return () => {
        window.removeEventListener('dashboard-duplicated', handleDashboardDuplicated);
      };
    }
  }, []);

  // Render the main content based on loading state
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
            onRefresh={refreshData}
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
          // Navigate to dashboard creation page or trigger creation modal
          // This would be implemented based on your app's dashboard creation flow
        }}
      />
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex-1 space-y-6">
        {/* Header with actions */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboards</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                setViewMode(prev => prev === ViewMode.Grid ? ViewMode.List : ViewMode.Grid)
              }
              title={viewMode === ViewMode.Grid ? "List view" : "Grid view"}
            >
              {viewMode === ViewMode.Grid ? (
                <List className="h-4 w-4" />
              ) : (
                <Grid className="h-4 w-4" />
              )}
            </Button>
            
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Dashboard
            </Button>
          </div>
        </div>

        {/* Dashboard content */}
        <div className="space-y-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
