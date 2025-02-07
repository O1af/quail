"use client";
import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/header/mode-toggle";
import { DashSidebar } from "@/components/sidebar/dash-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import Chat from "@/components/BI/Chat/Chat";
import { useParams } from "next/navigation";

export default function Page() {
  const params = useParams<{ id: string }>();
  return (
    <SidebarProvider>
      <DashSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
          </div>
          <div className="flex items-center gap-2 px-4 ml-auto">
            <ModeToggle />
          </div>
        </header>
        <div className="flex-1 p-4">
          <Chat className="h-[calc(100vh-12rem)]" id={params.id} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
