"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Share2,
  BarChart3,
  Database,
  SearchCode,
  Search,
} from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function DashNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { isMobile } = useSidebar();

  const isActive = (path: string) => pathname?.startsWith(path);

  const navigationItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboards",
      path: "/dashboards",
      description: "View and manage dashboards",
      color: "text-indigo-500",
    },
    {
      icon: BarChart3,
      label: "Charts",
      path: "/charts",
      description: "View and manage charts",
      color: "text-emerald-500",
    },
    {
      icon: Database,
      label: "Connections",
      path: "/connections",
      description: "Manage data connections",
      color: "text-blue-500",
    },
    {
      label: "SQL Editor",
      icon: SearchCode,
      path: "/editor",
      description: "AI Powered SQL Editor",
      color: "text-amber-500",
    },
  ];

  return (
    <TooltipProvider>
      <SidebarGroup>
        <SidebarGroupLabel className="mb-1 pl-1">
          <span className="text-xs font-medium text-muted-foreground">
            Navigation
          </span>
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {navigationItems.map((item) => (
              <SidebarMenuItem key={item.path} className="mb-0.5">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarMenuButton
                      onClick={() => router.push(item.path)}
                      isActive={isActive(item.path)}
                      className={`rounded-md transition-all duration-200 ${
                        isActive(item.path)
                          ? "bg-accent/60 shadow-sm"
                          : "hover:bg-muted"
                      }`}
                    >
                      <item.icon
                        className={`h-4 w-4 mr-2 flex-shrink-0 ${item.color}`}
                      />
                      <span className="truncate">{item.label}</span>
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  <TooltipContent side={isMobile ? "bottom" : "right"}>
                    {item.description}
                  </TooltipContent>
                </Tooltip>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </TooltipProvider>
  );
}
