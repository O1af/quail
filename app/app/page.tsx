"use client";
import { UnifiedSidebar } from "@/components/sidebar/unified-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/header/mode-toggle";
import { HeaderProvider } from "@/components/header/header-context";

export default function Page() {
  return (
    <HeaderProvider>
      <SidebarProvider>
        <UnifiedSidebar mode="dash" />
        <SidebarInset className="h-screen max-h-screen flex flex-col overflow-hidden">
          <header className="flex h-16 shrink-0 items-center border-b px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
            </div>

            {/* Middle section with page-specific content */}
            <div className="flex-1 ml-4">
              {/* HeaderContent would go here if needed */}
            </div>

            <div className="flex items-center gap-3 ml-auto">
              {/* HeaderButtons would go here if needed */}
              <ModeToggle />
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <h1 className="text-2xl font-bold">Overview</h1>
              <p>This is the overview page.</p>
              <p>More content will be added here soon.</p>
              <p>Stay tuned for updates!</p>
              <p>Thank you for your patience.</p>
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </HeaderProvider>
  );
}
