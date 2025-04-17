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
    },
    {
      icon: BarChart3,
      label: "Charts",
      path: "/charts",
      description: "View and manage charts",
    },
    {
      icon: Database,
      label: "Connections",
      path: "/connections",
      description: "Manage data connections",
    },
    {
      label: "SQL Editor",
      icon: SearchCode,
      path: "/editor",
      description: "AI Powered SQL Editor",
    },
  ];

  return (
    <TooltipProvider>
      <SidebarGroup>
        <SidebarGroupLabel>Navigation</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {navigationItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarMenuButton
                      onClick={() => router.push(item.path)}
                      isActive={isActive(item.path)}
                    >
                      <item.icon className="h-4 w-4 mr-2 flex-shrink-0" />
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
