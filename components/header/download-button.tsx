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
import { useState, useEffect, useCallback } from "react";
import { downloadSQL } from "../stores/utils/downloadSQL";
import { downloadCSV } from "../stores/utils/downloadCSV";
import React from "react";

export const DownloadButton = React.memo(function DownloadButton() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedType, setSelectedType] = useState<"sql" | "data">("sql");
  const [isOpen, setIsOpen] = useState(false);

  const handleDownload = useCallback(async (format: string) => {
    setIsDownloading(true);
    setIsOpen(false);
    try {
      // console.log(format, selectedType);
      if (format === "SQL") {
        await downloadSQL("query");
      } else if (format === "CSV") {
        await downloadCSV();
      } else {
      }
    } finally {
      setIsDownloading(false);
    }
  }, []);

  const handleTypeChange = useCallback((v: string) => {
    setSelectedType(v as "sql" | "data");
  }, []);

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
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
          setSelectedType("sql");
        }}
      >
        <div className="p-2">
          <Tabs
            defaultValue="sql"
            className="w-full"
            onValueChange={handleTypeChange}
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
});
