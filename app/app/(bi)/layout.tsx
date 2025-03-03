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
import { StickyNoteIcon } from "lucide-react";

/**
 * BI Layout component used for all business intelligence pages
 */
export default function BILayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");

  const isInsightsPage = pathname === "/insights";

  // Function to handle search updates for insights
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    window.dispatchEvent(new CustomEvent("app:search", { detail: { query } }));
  };

  const nav = [
    // ...existing nav items...
    {
      title: "Notes",
      href: "/notes",
      icon: StickyNoteIcon,
    },
  ];

  return (
    <SidebarProvider>
      <DashSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
          </div>

          {/* Middle section with search (only on insights page) */}
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
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {isInsightsPage ? <CreateDashboard /> : <CreateChat />}
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
