"use client";
import React, { useEffect, useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/header/mode-toggle";
import { createClient } from "@/utils/supabase/client";
import { DashSidebar } from "@/components/sidebar/dash-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function Page() {
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      if (!user) {
        window.location.href = `${process.env.NEXT_PUBLIC_APP_URL}/login`;
      }
    };
    fetchUser();
  }, [supabase]);
  return (
    <SidebarProvider>
      <DashSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
          </div>
          <div className="flex items-center gap-2 px-4 ml-auto">
            <ModeToggle />
          </div>
        </header>
        <div className="flex items-center gap-2 px-4 ml-auto">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
