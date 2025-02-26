"use client";
import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/header/mode-toggle";
import { DashSidebar } from "@/components/sidebar/dash-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { CreateChat } from "@/components/header/create-chat";

export default function BILayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <DashSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center border-b">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
          </div>
          <div className="flex items-center gap-3 px-4 ml-auto">
            <CreateChat />
            <ModeToggle />
          </div>
        </header>
        <div className="flex-1 p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
