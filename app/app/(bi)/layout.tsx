"use client";
import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/header/buttons/mode-toggle";
import { UnifiedSidebar } from "@/components/sidebar/unified-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { HeaderProvider, useHeader } from "@/components/header/header-context";

// Header content component that uses the context
function HeaderContent() {
  const { headerContent } = useHeader();

  // If there's custom header content, render it
  if (headerContent) {
    return <>{headerContent}</>;
  }

  return null;
}

// Header buttons component that uses the context
function HeaderButtons() {
  const { headerButtons } = useHeader();

  if (headerButtons) {
    return <>{headerButtons}</>;
  }

  return null;
}

/**
 * BI Layout component used for all business intelligence pages
 */
export default function BILayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isEditorRoute = pathname.includes("/editor");

  return (
    <HeaderProvider>
      <SidebarProvider>
        <UnifiedSidebar mode={isEditorRoute ? "dev" : "dash"} />
        <SidebarInset className="h-screen max-h-screen flex flex-col overflow-hidden">
          <header className="flex h-14 shrink-0 items-center border-b px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
            </div>

            {/* Middle section with page-specific content */}
            <div className="flex-1 ml-4">
              <HeaderContent />
            </div>

            <div className="flex items-center gap-3 ml-auto">
              <HeaderButtons />
              <ModeToggle />
            </div>
          </header>

          {children}
        </SidebarInset>
      </SidebarProvider>
    </HeaderProvider>
  );
}
