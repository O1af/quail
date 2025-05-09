"use client";
import { SchemaExplorer } from "@/components/BI/connections/schema/SchemaExplorer";
import { useHeader } from "@/components/header/header-context";
import { useEffect, useState } from "react";
import { SearchBar } from "@/components/BI/connections/schema/SearchBar";

export default function SchemaPage() {
  const { setHeaderContent, setHeaderButtons } = useHeader();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Set the title and description in the header
    setHeaderContent(
      <div className="flex flex-col">
        <h1 className="text-xl font-semibold">Database Schema Explorer</h1>
        <p className="text-sm text-muted-foreground">
          Browse and explore your database structure
        </p>
      </div>
    );

    // Set the search in the header
    setHeaderButtons(
      <div className="w-64">
        <SearchBar value={searchTerm} onChange={setSearchTerm} />
      </div>
    );

    // Clean up when unmounting
    return () => {
      setHeaderContent(null);
      setHeaderButtons(null);
    };
  }, [setHeaderContent, setHeaderButtons, searchTerm]);

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex-1 overflow-hidden">
        <SchemaExplorer searchTerm={searchTerm} />
      </div>
    </div>
  );
}
