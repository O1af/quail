"use client";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState, useRef } from "react";
import React from "react";
import { useEditorStore } from "../../stores/editor_store";

export const UploadButton = React.memo(function UploadButton() {
  const setValue = useEditorStore((state) => state.setValue);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileRead = async (file: File) => {
    setIsUploading(true);
    try {
      const content = await file.text();
      setValue(content);
    } catch (error) {
      console.error("Error reading file:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith(".sql")) {
      handleFileRead(file);
    } else {
      console.error("Please select a .sql file");
    }
    // Reset the input
    if (event.target) {
      event.target.value = "";
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".sql"
        className="hidden"
      />
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={handleClick}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="h-[1.2rem] w-[1.2rem] animate-spin" />
              ) : (
                <Upload className="h-[1.2rem] w-[1.2rem]" />
              )}
              <span className="sr-only">Upload SQL</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Upload SQL file</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
});
