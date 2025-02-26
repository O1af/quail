"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

import { NavUser } from "@/components/sidebar/nav-user";
import { NavChats } from "@/components/sidebar/bi/dash-chats";
import { DashNav } from "@/components/sidebar/bi/dash-nav";
import { DashSidebarHeader } from "@/components/sidebar/bi/dash-header";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

export function DashSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
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
    <Sidebar collapsible="icon" {...props}>
      <DashSidebarHeader />
      <SidebarContent>
        <DashNav />
        <NavChats />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={supabaseData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
