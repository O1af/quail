"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

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
} from "@/components/ui/sidebar";

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
      className="h-screen max-h-screen overflow-hidden"
      {...props}
    >
      <SidebarHeader>
        <DashSidebarHeader />
      </SidebarHeader>
      <SidebarContent className="flex flex-col overflow-hidden">
        <DashNav />
        {mode === "dash" ? <NavChats /> : <NavSchema />}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={supabaseData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
