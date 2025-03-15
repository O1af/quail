"use client";
import ChartsPage from "@/components/BI/Charts/ChartsPage";
import { useHeader } from "@/components/header/header-context";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

export default function Charts() {
  const { setHeaderContent, setHeaderButtons } = useHeader();

  useEffect(() => {
    // Set custom header content
    setHeaderContent(
      <div className="flex flex-col">
        <h1 className="text-xl font-semibold">Your Charts</h1>
        <p className="text-sm text-muted-foreground">
          Visualize your data with customizable charts
        </p>
      </div>
    );

    // Set page-specific button
    setHeaderButtons(
      <Button className="gap-2" asChild variant="outline">
        <Link href="/charts/new">
          <PlusCircle className="h-4 w-4" />
          Create New Chart
        </Link>
      </Button>
    );

    // Clean up function to reset header content when navigating away
    return () => {
      setHeaderContent(null);
      setHeaderButtons(null);
    };
  }, [setHeaderContent, setHeaderButtons]);

  return <ChartsPage />;
}
