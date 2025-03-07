"use client";
import { Connections } from "@/components/BI/connections/connections";
import { useHeader } from "@/components/header/header-context";
import { useEffect } from "react";

export default function ConnectionsPage() {
  const { setHeaderContent } = useHeader();

  useEffect(() => {
    // Example of setting custom header content
    setHeaderContent(
      <div className="flex flex-col">
        <h1 className="text-xl font-semibold">Database Connections</h1>
        <p className="text-sm text-muted-foreground">
          Manage your database connections and credentials
        </p>
      </div>
    );

    // Clean up function to reset header content when navigating away
    return () => setHeaderContent(null);
  }, [setHeaderContent]);

  return (
    <div className="container max-w-5xl mx-auto">
      <Connections />
    </div>
  );
}
