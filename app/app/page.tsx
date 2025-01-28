"use client";
import React, { useEffect, useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ResizableDisplay } from "@/components/ResizableDisplay";
import { ModeToggle } from "@/components/header/mode-toggle";
import { createClient } from "@/utils/supabase/client";
import { RunButton } from "@/components/header/run-button";
import { DownloadButton } from "@/components/header/download-button";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ClearChat } from "@/components/header/clear-chat";
import { UploadButton } from "@/components/header/upload-button";

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
        window.location.href = "http://app.localhost:3000/login";
      }
    };
    fetchUser();
  }, [supabase]);
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <ClearChat />
          </div>
          <div className="flex items-center gap-2 px-4 ml-auto">
            <UploadButton />
            <DownloadButton />
            <RunButton />
            <ModeToggle />
          </div>
        </header>
        <ResizableDisplay />
      </SidebarInset>
    </SidebarProvider>
  );
}
