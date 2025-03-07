"use client";
import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/header/mode-toggle";
import { DashSidebar } from "@/components/sidebar/dash-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { CreateChat } from "@/components/header/create-chat";
import { usePathname } from "next/navigation";
import { CreateDashboard } from "@/components/header/create-dashboard";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeaderProvider, useHeader } from "@/components/header/header-context";

// Header content component that uses the context
function HeaderContent() {
  const { headerContent } = useHeader();
  const pathname = usePathname();

  // If there's custom header content, render it
  if (headerContent) {
    return <>{headerContent}</>;
  }

  return null;
}

/**
 * BI Layout component used for all business intelligence pages
 */
export default function BILayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isInsightsPage = pathname === "/insights";
  const isConnectionsPage = pathname === "/connections";

  return (
    <HeaderProvider>
      <SidebarProvider>
        <DashSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center border-b px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
            </div>

            {/* Middle section with page-specific content */}
            <div className="flex-1 ml-4">
              <HeaderContent />
            </div>

            <div className="flex items-center gap-3 ml-auto">
              {isInsightsPage ? (
                <CreateDashboard />
              ) : isConnectionsPage ? (
                <Button className="gap-2" id="add-connection-trigger">
                  <PlusCircle className="h-4 w-4" />
                  Add Connection
                </Button>
              ) : (
                <CreateChat />
              )}
              <ModeToggle />
            </div>
          </header>

          <div className="flex-1 p-4">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </HeaderProvider>
  );
}
