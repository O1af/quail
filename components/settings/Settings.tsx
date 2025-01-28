"use client";

import { useState, useEffect } from "react";
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
  // {
  //   title: "Account",
  //   href: "account",
  // },
  {
    title: "Databases",
    href: "database",
  },

  {
    title: "Billing",
    href: "billing",
  },
];

interface SettingsDialogProps {
  onOpenChange?: (open: boolean) => void;
}

export function SettingsDialog({ onOpenChange }: SettingsDialogProps) {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("database");

  useEffect(() => {
    const handleOpenSettings = (e: Event) => {
      if (e instanceof CustomEvent && e.detail?.section) {
        setActiveSection(e.detail.section);
      } else {
        setActiveSection("database"); // fallback to profile if no section specified
      }
      setOpen(true);
    };
    window.addEventListener("openSettings", handleOpenSettings);
    return () => {
      window.removeEventListener("openSettings", handleOpenSettings);
    };
  }, []);

  const renderContent = () => {
    switch (activeSection) {
      case "profile":
        return <ProfileForm />;
      case "database":
        return <DatabasesForm />;
      case "billing":
        return <BillingForm />;
      default:
        return <div>Section under construction</div>;
    }
  };

  const getSidebarWidth = () => {
    switch (activeSection) {
      case "billing":
        return "w-[180px] min-w-[180px]";
      default:
        return "w-1/3 max-w-[200px]";
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        onOpenChange?.(newOpen);
      }}
    >
      <DialogContent className="sm:max-w-[95vw] md:max-w-[1000px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight">
            Settings
          </DialogTitle>
        </DialogHeader>
        <div className="pt-8 flex flex-row flex-grow overflow-hidden">
          <aside className={`${getSidebarWidth()} pr-6 overflow-y-auto`}>
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
