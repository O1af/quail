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
import { useState, useEffect, useCallback } from "react";
import { downloadSelectedCSV } from "../stores/utils/downloadCSV";
import { downloadSelectedExcel } from "../stores/utils/downloadExcel";
import { downloadSelectedPDF } from "../stores/utils/downloadPDF";
import React from "react";

export const DataDownloadButton = React.memo(function DownloadButton() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleDownload = useCallback(async (format: string) => {
    setIsDownloading(true);
    setIsOpen(false);
    try {
      if (format === "CSV") {
        await downloadSelectedCSV();
      } else if (format === "Excel") {
        await downloadSelectedExcel();
      } else if (format === "PDF") {
        await downloadSelectedPDF();
      }
    } finally {
      setIsDownloading(false);
    }
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

      <DropdownMenuContent align="end" className="w-[200px]">
        <div className="p-2 space-y-2">
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
            onClick={() => handleDownload("Excel")}
            disabled={isDownloading}
          >
            Download Excel
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
