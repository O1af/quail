"use client";

import { useState, useEffect, useCallback, memo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import { SidebarNav } from "./sidebar-nav";
import { DatabasesForm } from "./DatabaseForm/databases-form";
import { BillingForm } from "./BillingForm/billing-form";
import { GeneralForm } from "./general-form";

const sidebarNavItems = [
  {
    title: "General",
    href: "general",
  },
  {
    title: "Billing",
    href: "billing",
  },
  {
    title: "Connections",
    href: "connections",
  },
];

interface SettingsDialogProps {
  onOpenChange?: (open: boolean) => void;
}

// Memoize form components to prevent unnecessary re-renders
const MemoizedGeneralForm = memo(GeneralForm);
const MemoizedDatabasesForm = memo(DatabasesForm);
const MemoizedBillingForm = memo(BillingForm);

export function SettingsDialog({ onOpenChange }: SettingsDialogProps) {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("general");

  // Memoize event handler
  const handleOpenSettings = useCallback((e: Event) => {
    if (e instanceof CustomEvent && e.detail?.section) {
      setActiveSection(e.detail.section);
    } else {
      setActiveSection("general");
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
      case "general":
        return <MemoizedGeneralForm />;
      case "connections":
        return <MemoizedDatabasesForm />;
      case "billing":
        return <MemoizedBillingForm />;
      default:
        return <MemoizedGeneralForm />;
    }
  }, [activeSection]);

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
      <DialogContent className="sm:max-w-[900px] w-[95vw] max-h-[95vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">Settings</DialogTitle>
          </div>
        </DialogHeader>
        <div className="flex h-[600px] overflow-hidden">
          <aside className="w-[240px] border-r p-6 overflow-y-auto">
            <SidebarNav
              items={sidebarNavItems}
              activeSection={activeSection}
              setActiveSection={setActiveSection}
            />
          </aside>
          <div className="flex-1 overflow-y-auto p-6">{renderContent()}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
