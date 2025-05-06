"use client";
import React, { useEffect } from "react";
import { useHeader } from "@/components/header/header-context"; // Corrected import path
import { useRouter } from "next/navigation";

// This page is largely superseded by the dialog functionality.
// It can be removed or repurposed.
// For now, it will redirect to the editor page.

export default function Page() {
  const { setHeaderContent, setHeaderButtons } = useHeader();
  const router = useRouter();

  useEffect(() => {
    // Clear any specific header content for this page if it was set previously
    setHeaderContent(null);
    setHeaderButtons(null);

    // Redirect to the main editor page as this view is now a dialog
    router.replace("/app/editor");
  }, [setHeaderContent, setHeaderButtons, router]);

  return (
    <div className="flex-1 overflow-hidden p-4 flex items-center justify-center">
      <p className="text-muted-foreground">
        The advanced data view is now available as a dialog on the editor page.
        Redirecting...
      </p>
    </div>
  );
}
