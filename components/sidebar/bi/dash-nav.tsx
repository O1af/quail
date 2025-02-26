"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  Settings,
  LayoutDashboard,
  Share2,
  BarChart3,
  Database,
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
      label: "Analytics",
      path: "/analytics",
      description: "Data analytics and reports",
      badge: "New",
    },
    {
      icon: Share2,
      label: "Connections",
      path: "/connections",
      description: "Manage data connections",
    },
    {
      icon: Database,
      label: "Data Sources",
      path: "/sources",
      description: "Configure data sources",
    },
    {
      icon: Settings,
      label: "Settings",
      path: "/settings",
      description: "Configure dashboard settings",
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
                      {item.badge && (
                        <Badge
                          variant="outline"
                          className="ml-auto text-xs py-0 h-5 bg-primary/10 text-primary"
                        >
                          {item.badge}
                        </Badge>
                      )}
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
