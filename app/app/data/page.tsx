"use client";
import React, { useEffect, useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/header/mode-toggle";
import Routes from "@/components/routes";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation"; // For client-side navigation
import { DownloadButton } from "@/components/header/download-button";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { BetterDataTable } from "@/components/Custom/DataTable/better-data-table";
import DataHeader from "@/components/Custom/DataTable/header";

export default function Page() {
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      if (!user) {
        router.push(Routes.LoginPage);
      }
    };
    fetchUser();
  }, [router, supabase]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
          </div>
          <div className="flex items-center gap-2 px-4 ml-auto">
            <DataHeader />
            <DownloadButton />
            <ModeToggle />
          </div>
        </header>
        <div className="flex-1">
          <BetterDataTable />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
