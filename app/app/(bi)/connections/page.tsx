"use client";
import { Connections } from "@/components/BI/connections/connections";
import { useHeader } from "@/components/header/header-context";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function ConnectionsPage() {
  const { setHeaderContent, setHeaderButtons } = useHeader();

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

    // Set page-specific button
    setHeaderButtons(
      <Button className="gap-2" id="add-connection-trigger">
        <PlusCircle className="h-4 w-4" />
        Add Connection
      </Button>
    );

    // Clean up function to reset header content when navigating away
    return () => {
      setHeaderContent(null);
      setHeaderButtons(null);
    };
  }, [setHeaderContent, setHeaderButtons]);

  return (
    <div className="container max-w-5xl mx-auto">
      <Connections />
    </div>
  );
}
