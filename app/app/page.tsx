"use client";
import {
  useQuery,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { UnifiedSidebar } from "@/components/sidebar/unified-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/header/buttons/mode-toggle";
import { HeaderProvider } from "@/components/header/header-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import {
  loadUserDashboards,
  loadSharedDashboards,
  Dashboard,
} from "@/components/stores/dashboard_store";
import { listCharts } from "@/components/stores/chart_store";
import { ActivityList } from "@/components/Overview/ActivityList";
import { ActivityItem, fetchRecentActivities } from "@/lib/utils/activity";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Database,
  Code,
  MessageSquare,
} from "lucide-react";
import { listChats as listChatHistory } from "@/components/stores/chat_store";

interface DashboardPageData {
  stats: DashboardStats;
  recentDashboards: Dashboard[];
}

interface DashboardStats {
  totalDashboards: number;
  totalCharts: number;
  totalChats: number;
  recentChatCount: number;
}

// Create a client
const queryClient = new QueryClient();

function PageContent() {
  const router = useRouter();

  // Fetch user
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        return data.user;
      }
      throw new Error("User not found");
    },
    staleTime: Infinity, // User data is unlikely to change frequently within a session
  });

  // Fetch combined data for stats and recent dashboards
  const { data: pageData, isLoading: isLoadingPageData } = useQuery<
    DashboardPageData,
    Error
  >({
    queryKey: ["dashboardPageData", user?.id, user?.email],
    queryFn: async () => {
      if (!user || !user.id || !user.email) {
        throw new Error("User ID or email not available for page data");
      }
      const [
        userDashboards, // Fetched without limit, sorted by updatedAt
        sharedDashboards,
        userCharts, // Fetched without limit, sorted by updatedAt
        userChatsData, // Fetched without limit, sorted by updatedAt
      ] = await Promise.all([
        loadUserDashboards(user.id, { sort: { updatedAt: -1 } }), // Ensure sorted for recent
        loadSharedDashboards(user.email),
        listCharts(user.id), // Ensure sorted
        listChatHistory(user.id), // Ensure sorted
      ]);

      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      const recentChats = userChatsData.filter(
        (chat) => new Date(chat.updatedAt) > oneMonthAgo
      );

      return {
        stats: {
          totalDashboards: userDashboards.length + sharedDashboards.length,
          totalCharts: userCharts.length,
          totalChats: userChatsData.length,
          recentChatCount: recentChats.length,
        },
        recentDashboards: userDashboards.slice(0, 3),
      };
    },
    enabled: !!user, // Only run query if user is loaded
  });

  // Fetch recent activities (remains separate as its needs are specific and limited)
  const { data: activities, isLoading: isLoadingActivities } = useQuery<
    ActivityItem[],
    Error
  >({
    queryKey: ["recentActivities", user?.id],
    queryFn: async () => {
      if (!user || !user.id) {
        throw new Error("User ID not available for activities");
      }
      return await fetchRecentActivities(user.id, 10); // Fetch 10 recent activities
    },
    enabled: !!user,
  });

  const isLoading = isLoadingUser || isLoadingPageData || isLoadingActivities;
  const stats = pageData?.stats;
  const recentDashboards = pageData?.recentDashboards ?? [];

  // Handle quick action clicks
  const handleCreateDashboard = () => {
    router.push(`/dashboards?new=true`);
  };

  const handleCreateChart = () => {
    router.push("/charts");
  };

  const handleSqlEditor = () => {
    router.push("/editor");
  };

  const handleConnectData = () => {
    router.push("/connections");
  };

  const handleChat = () => {
    router.push("/chat");
  };

  return (
    <HeaderProvider>
      <SidebarProvider>
        <UnifiedSidebar mode="dash" />
        <SidebarInset className="h-screen max-h-screen flex flex-col overflow-hidden">
          <header className="flex h-14 shrink-0 items-center border-b px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
            </div>

            {/* Middle section with page-specific content */}
            <div className="flex-1 ml-4">
              {/* HeaderContent would go here if needed */}
            </div>

            <div className="flex items-center gap-3 ml-auto">
              {/* HeaderButtons would go here if needed */}
              <ModeToggle />
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            <div className="container mx-auto py-6 space-y-8">
              {/* Page Header */}
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
                <p className="text-muted-foreground">
                  Welcome to Quail, your AI-powered SQL and data visualization
                  platform.
                </p>
              </div>

              {/* Stats Overview Section */}
              <div className="mt-8">
                <div className="grid gap-6 md:grid-cols-3">
                  <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Dashboards
                      </CardTitle>
                      <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {isLoadingUser || isLoadingPageData ? (
                          <span className="animate-pulse">...</span>
                        ) : (
                          stats?.totalDashboards ?? 0
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {(stats?.totalDashboards ?? 0) > 1
                          ? `${Math.floor(
                              (stats?.totalDashboards ?? 0) * 0.25
                            )} new this month`
                          : "Create your first dashboard"}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Charts Created
                      </CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {isLoadingUser || isLoadingPageData ? (
                          <span className="animate-pulse">...</span>
                        ) : (
                          stats?.totalCharts ?? 0
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {(stats?.totalCharts ?? 0) > 1
                          ? `${Math.floor(
                              (stats?.totalCharts ?? 0) * 0.3
                            )} from last month`
                          : "Create your first chart"}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        AI Chat Sessions
                      </CardTitle>
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {isLoadingUser || isLoadingPageData ? (
                          <span className="animate-pulse">...</span>
                        ) : (
                          stats?.totalChats ?? 0
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {(stats?.totalChats ?? 0) > 0
                          ? `${stats?.recentChatCount ?? 0} new this month`
                          : "0 new this month"}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Recent Activity & Quick Actions Side by Side */}
              <div className="grid gap-6 md:grid-cols-7 mt-10">
                {/* Recent Activity */}
                <Card className="md:col-span-4 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent className="pl-2 pt-0">
                    {isLoadingUser || isLoadingActivities ? (
                      <div className="space-y-8">
                        {[...Array(4)].map((_, i) => (
                          <div
                            key={i}
                            className="flex items-center animate-pulse"
                          >
                            <div className="w-5 h-5 bg-muted rounded-full mr-4"></div>
                            <div className="space-y-2 flex-1">
                              <div className="h-4 bg-muted rounded w-3/4"></div>
                              <div className="h-3 bg-muted rounded w-1/4"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <ActivityList activities={activities ?? []} />
                    )}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="md:col-span-3 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid gap-3">
                      <Button
                        className="justify-start h-11"
                        variant="outline"
                        onClick={handleCreateDashboard}
                      >
                        <LayoutDashboard className="mr-3 h-4 w-4" />
                        Create Dashboard
                      </Button>
                      <Button
                        className="justify-start h-11"
                        variant="outline"
                        onClick={handleCreateChart}
                      >
                        <BarChart3 className="mr-3 h-4 w-4" />
                        View Charts
                      </Button>
                      <Button
                        className="justify-start h-11"
                        variant="outline"
                        onClick={handleSqlEditor}
                      >
                        <Code className="mr-3 h-4 w-4" />
                        SQL Editor
                      </Button>
                      <Button
                        className="justify-start h-11"
                        variant="outline"
                        onClick={handleConnectData}
                      >
                        <Database className="mr-3 h-4 w-4" />
                        Connect Data Source
                      </Button>
                      <Button
                        className="justify-start h-11"
                        variant="outline"
                        onClick={handleChat}
                      >
                        <MessageSquare className="mr-3 h-4 w-4" />
                        New Chat
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Help Section */}
              <div className="mt-12 border-t pt-6 text-center">
                <p className="text-muted-foreground mb-2">
                  Need help?{" "}
                  <Link
                    href={`${process.env.NEXT_PUBLIC_BASE_URL}/docs`}
                    className="font-medium text-primary hover:underline"
                  >
                    Docs
                  </Link>{" "}
                  <span className="mx-2">|</span>{" "}
                  <Link
                    href={`${process.env.NEXT_PUBLIC_BASE_URL}/contact`}
                    className="font-medium text-primary hover:underline"
                  >
                    Contact Us
                  </Link>
                </p>
              </div>
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </HeaderProvider>
  );
}

export default function Page() {
  return (
    <QueryClientProvider client={queryClient}>
      <PageContent />
    </QueryClientProvider>
  );
}
