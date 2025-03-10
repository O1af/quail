"use client";

import { useState, useEffect, useCallback, memo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SidebarNav } from "./sidebar-nav";
import { ProfileForm } from "./profile-form";
import { DatabasesForm } from "./DatabaseForm/databases-form";
import { BillingForm } from "./BillingForm/billing-form";

const sidebarNavItems = [
  {
    title: "Profile",
    href: "profile",
  },
  {
    title: "Billing",
    href: "billing",
  },
];

interface SettingsDialogProps {
  onOpenChange?: (open: boolean) => void;
}

// Memoize form components to prevent unnecessary re-renders
const MemoizedProfileForm = memo(ProfileForm);
const MemoizedDatabasesForm = memo(DatabasesForm);
const MemoizedBillingForm = memo(BillingForm);

export function SettingsDialog({ onOpenChange }: SettingsDialogProps) {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("database");

  // Memoize event handler
  const handleOpenSettings = useCallback((e: Event) => {
    if (e instanceof CustomEvent && e.detail?.section) {
      setActiveSection(e.detail.section);
    } else {
      setActiveSection("database");
    }
    setOpen(true);
  }, []);

  useEffect(() => {
    window.addEventListener("openSettings", handleOpenSettings);
    return () => window.removeEventListener("openSettings", handleOpenSettings);
  }, [handleOpenSettings]);

  // Memoize content rendering
  const renderContent = useCallback(() => {
    switch (activeSection) {
      case "profile":
        return <MemoizedProfileForm />;
      case "database":
        return <MemoizedDatabasesForm />;
      case "billing":
        return <MemoizedBillingForm />;
      default:
        return <div>Section under construction</div>;
    }
  }, [activeSection]);

  // Memoize sidebar width calculation
  const sidebarWidth =
    activeSection === "billing"
      ? "w-[180px] min-w-[180px]"
      : "w-1/3 max-w-[200px]";

  // Memoize open change handler
  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      setOpen(newOpen);
      onOpenChange?.(newOpen);
    },
    [onOpenChange]
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[1000px] w-[95vw] h-[700px] max-h-[95vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight">
            Settings
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 flex flex-row overflow-hidden">
          <aside className={`${sidebarWidth} pr-6 overflow-y-auto`}>
            <SidebarNav
              items={sidebarNavItems}
              activeSection={activeSection}
              setActiveSection={setActiveSection}
            />
          </aside>
          <div className="flex-1 overflow-y-auto pr-6">{renderContent()}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
