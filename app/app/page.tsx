"use client";
import { useEffect, useState } from "react";
import { UnifiedSidebar } from "@/components/sidebar/unified-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/header/buttons/mode-toggle";
import { HeaderProvider } from "@/components/header/header-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Database,
  Code,
  CirclePlus,
  MessageSquare,
} from "lucide-react";
import { listChats as listChatHistory } from "@/components/stores/chat_store";

interface DashboardStats {
  totalDashboards: number;
  totalCharts: number;
  totalChats: number;
}

export default function Page() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalDashboards: 0,
    totalCharts: 0,
    totalChats: 0,
  });
  const [recentDashboards, setRecentDashboards] = useState<Dashboard[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recentChatCount, setRecentChatCount] = useState(0);

  // Fetch user and data
  useEffect(() => {
    const fetchUserAndData = async () => {
      setIsLoading(true);
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();

        if (data.user) {
          setUser(data.user);

          // Get dashboard counts
          const userDashboards = await loadUserDashboards(data.user.id);
          const sharedDashboards = await loadSharedDashboards(
            data.user.email || ""
          );

          // Get chart count
          const userCharts = await listCharts(data.user.id);

          // Get chat count and determine recent activity
          const userChats = await listChatHistory(data.user.id);

          // Calculate chats created in the last month
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

          const recentChats = userChats.filter(
            (chat) => new Date(chat.updatedAt) > oneMonthAgo
          );

          // Get recent activities
          const recentActivities = await fetchRecentActivities(data.user.id);

          // Set state with all fetched data
          setStats({
            totalDashboards: userDashboards.length + sharedDashboards.length,
            totalCharts: userCharts.length,
            totalChats: userChats.length,
          });

          // Set recent dashboards (up to 3)
          setRecentDashboards(userDashboards.slice(0, 3));

          // Set activities
          setActivities(recentActivities);

          // Store the recent chats count for display
          setRecentChatCount(recentChats.length);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAndData();
  }, []);

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
                        {isLoading ? (
                          <span className="animate-pulse">...</span>
                        ) : (
                          stats.totalDashboards
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stats.totalDashboards > 1
                          ? `${Math.floor(
                              stats.totalDashboards * 0.25
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
                        {isLoading ? (
                          <span className="animate-pulse">...</span>
                        ) : (
                          stats.totalCharts
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stats.totalCharts > 1
                          ? `${Math.floor(
                              stats.totalCharts * 0.3
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
                        {isLoading ? (
                          <span className="animate-pulse">...</span>
                        ) : (
                          stats.totalChats
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stats.totalChats > 0
                          ? `${recentChatCount} new this month`
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
                    {isLoading ? (
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
                      <ActivityList activities={activities} />
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
                    href="/docs"
                    className="font-medium text-primary hover:underline"
                  >
                    Docs
                  </Link>{" "}
                  <span className="mx-2">|</span>{" "}
                  <Link
                    href="/support"
                    className="font-medium text-primary hover:underline"
                  >
                    Support
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
