"use client";
import { Connections } from "@/components/BI/connections/ConnectionsPage";
import { useHeader } from "@/components/header/header-context";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useConnectionsState } from "@/lib/hooks/useConnectionsState";

export default function ConnectionsPage() {
  const { setHeaderContent, setHeaderButtons } = useHeader();
  const { openAddConnectionForm } = useConnectionsState();

  useEffect(() => {
    setHeaderContent(
      <div className="flex flex-col">
        <h1 className="text-xl font-semibold tracking-tight">Connections</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your database connections
        </p>
      </div>
    );

    setHeaderButtons(
      <Button 
        variant="default" 
        size="sm" 
        className="gap-1.5 h-9" 
        onClick={openAddConnectionForm}
      >
        <PlusCircle className="h-4 w-4" />
        New Connection
      </Button>
    );

    return () => {
      setHeaderContent(null);
      setHeaderButtons(null);
    };
  }, [setHeaderContent, setHeaderButtons, openAddConnectionForm]);

  return (
    <div className="h-full overflow-hidden flex flex-col">
      <Connections />
    </div>
  );
}
