"use client";
import React, { useEffect } from "react";
import { DataDownloadButton } from "@/components/header/buttons/data-download-button";
import { BetterDataTable } from "@/components/Dev/DataTable/better-data-table";
import DataHeader from "@/components/Dev/DataTable/header";
import { useHeader } from "@/components/header/header-context"; // Import useHeader

export default function Page() {
  const { setHeaderContent, setHeaderButtons } = useHeader(); // Use the header context

  useEffect(() => {
    // Set the header content and buttons specific to the data page
    setHeaderContent(<DataHeader />);
    setHeaderButtons(<DataDownloadButton />);

    // Clean up when component unmounts
    return () => {
      setHeaderContent(null);
      setHeaderButtons(null);
    };
  }, [setHeaderContent, setHeaderButtons]);

  // Removed user auth logic (useEffect, useState, supabase, router, Routes import)
  // Assumes auth is handled by a parent layout/context

  return (
    // Removed local <header> element
    <div className="flex-1 overflow-hidden p-4">
      {" "}
      {/* Added padding for content */}
      <BetterDataTable />
    </div>
  );
}
