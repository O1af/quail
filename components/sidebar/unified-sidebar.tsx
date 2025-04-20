"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Settings2 } from "lucide-react";

import { NavUser } from "@/components/sidebar/nav-user";
import { NavChats } from "@/components/sidebar/dash-chats";
import { DashNav } from "@/components/sidebar/dash-nav";
import { DashSidebarHeader } from "@/components/sidebar/dash-header";
import { NavSchema } from "@/components/sidebar/nav-schema";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SettingsDialog } from "@/components/settings/Settings";

interface UnifiedSidebarProps extends React.ComponentProps<typeof Sidebar> {
  mode: "dash" | "dev";
}

export function UnifiedSidebar({ mode, ...props }: UnifiedSidebarProps) {
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, [router, supabase]);

  const fullName = user?.user_metadata?.full_name ?? "";
  const email = user?.user_metadata?.email ?? "";
  const avatar_url = user?.user_metadata?.avatar_url ?? "";

  const supabaseData = {
    user: {
      name: fullName,
      email: email,
      avatar: avatar_url,
    },
  };

  return (
    <Sidebar
      collapsible="icon"
      className="h-screen max-h-screen overflow-hidden border-r bg-card"
      {...props}
    >
      <SidebarHeader>
        <DashSidebarHeader />
      </SidebarHeader>
      <SidebarContent className="flex flex-col overflow-hidden px-2 py-2">
        <div className="shrink-0">
          <DashNav />
        </div>
        <div
          className={`${
            mode === "dev" ? "grow" : ""
          } overflow-y-auto mt-1`}
        >
          {mode === "dash" ? <NavChats /> : <NavSchema />}
        </div>
      </SidebarContent>
      <SidebarFooter className="border-t pt-2 pb-2 px-2">
        <TooltipProvider>
          <SidebarMenu>
            <SidebarMenuItem className="mb-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton
                    onClick={() => {
                      const event = new CustomEvent("openSettings", {});
                      window.dispatchEvent(event);
                    }}
                    className="hover:bg-muted rounded-md transition-colors"
                  >
                    <Settings2 className="h-4 w-4 mr-2 shrink-0 text-muted-foreground" />
                    <span className="truncate">Settings</span>
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent side="right">
                  Application settings
                </TooltipContent>
              </Tooltip>
            </SidebarMenuItem>
          </SidebarMenu>
        </TooltipProvider>
        <NavUser user={supabaseData.user} />
      </SidebarFooter>
      <SidebarRail className="border-r" />
    </Sidebar>
  );
}
