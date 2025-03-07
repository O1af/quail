"use client";
import React, { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/header/mode-toggle";
import { DashSidebar } from "@/components/sidebar/dash-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { CreateChat } from "@/components/header/create-chat";
import { usePathname } from "next/navigation";
import { SearchBar } from "@/components/header/dashboard-search-bar";
import { CreateDashboard } from "@/components/header/create-dashboard";
import { PlusCircle, StickyNoteIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * BI Layout component used for all business intelligence pages
 */
export default function BILayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");

  const isInsightsPage = pathname === "/insights";
  const isConnectionsPage = pathname === "/connections";

  // Function to handle search updates for insights
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    window.dispatchEvent(new CustomEvent("app:search", { detail: { query } }));
  };

  return (
    <SidebarProvider>
      <DashSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
          </div>

          {/* Middle section with search or page title */}
          <div className="flex-1 ml-4">
            {isInsightsPage && (
              <SearchBar
                placeholder="Search insights..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full max-w-lg mx-auto"
                debounceMs={300}
              />
            )}

            {isConnectionsPage && (
              <div>
                <h1 className="text-xl font-semibold">Database Connections</h1>
                <p className="text-sm text-muted-foreground">
                  Connect to your databases to access and query your data.
                </p>
              </div>
            )}
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

        <div className="flex-1 p-4">
          {/* Pass the search query to children components through props */}
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child) && isInsightsPage) {
              return React.cloneElement(child, { searchQuery } as {
                searchQuery: string;
              });
            }
            return child;
          })}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
