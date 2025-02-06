"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  AudioWaveform,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
} from "lucide-react";

import { NavProjects } from "@/components/sidebar/nav-projects";
import { NavUser } from "@/components/sidebar/nav-user";
import { TeamSwitcher } from "@/components/sidebar/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavSchema } from "./nav-schema";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
};

export function DevSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        {/* <ResizablePanelGroup direction="vertical">
          <ResizablePanel defaultSize={50} minSize={20}>
            <NavSchema />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel minSize={20}>
            <NavProjects projects={data.projects} />
          </ResizablePanel>
        </ResizablePanelGroup> */}
        <NavSchema />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={supabaseData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
