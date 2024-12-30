"use client";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function DownloadButton() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedType, setSelectedType] = useState<"sql" | "data">("sql");
  const [isOpen, setIsOpen] = useState(false);

  const handleDownload = async (format: string) => {
    setIsDownloading(true);
    setIsOpen(false); // Close menu when download starts
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log(`Downloading ${format}`);
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []); // Remove selectedType dependency since we're not using it anymore

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" disabled={isDownloading}>
                {isDownloading ? (
                  <Loader2 className="h-[1.2rem] w-[1.2rem] animate-spin" />
                ) : (
                  <Download className="h-[1.2rem] w-[1.2rem]" />
                )}
                <span className="sr-only">Download options</span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Download options</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenuContent
        align="end"
        className="w-[200px]"
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          setSelectedType("sql"); // Reset to default when menu closes
        }}
      >
        <div className="p-2">
          <Tabs
            defaultValue="sql"
            className="w-full"
            onValueChange={(v) => setSelectedType(v as "sql" | "data")}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="sql">SQL</TabsTrigger>
              <TabsTrigger value="data">Data</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="mt-2 space-y-2">
            {selectedType === "sql" ? (
              <Button
                variant="outline"
                className="w-full justify-start hover:bg-secondary"
                onClick={() => handleDownload("SQL")}
                disabled={isDownloading}
              >
                Download SQL
              </Button>
            ) : (
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start hover:bg-secondary"
                  onClick={() => handleDownload("CSV")}
                  disabled={isDownloading}
                >
                  Download CSV
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start hover:bg-secondary"
                  onClick={() => handleDownload("PDF")}
                  disabled={isDownloading}
                >
                  Download PDF
                </Button>
              </div>
            )}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
