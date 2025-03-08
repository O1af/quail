"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, ArrowLeft } from "lucide-react";

interface ChartEditorHeaderProps {
  title: string;
  setTitle: (title: string) => void;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  onSave: () => void;
  onBack: () => void;
  setHasUnsavedChanges: (value: boolean) => void;
}

export default function ChartEditorHeader({
  title,
  setTitle,
  isSaving,
  hasUnsavedChanges,
  onSave,
  onBack,
  setHasUnsavedChanges,
}: ChartEditorHeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Update temporary title when the actual title changes
  useEffect(() => {
    setTempTitle(title);
  }, [title]);

  // Focus the input when editing starts
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  const handleSaveTitle = () => {
    if (tempTitle !== title) {
      setTitle(tempTitle || "Untitled Chart");
      setHasUnsavedChanges(true);
    }
    setIsEditingTitle(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSaveTitle();
    else if (e.key === "Escape") {
      setTempTitle(title);
      setIsEditingTitle(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 hidden sm:flex"
          onClick={onBack}
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        {isEditingTitle ? (
          <Input
            ref={titleInputRef}
            className="w-[240px] h-9 text-xl font-semibold"
            value={tempTitle}
            onChange={(e) => setTempTitle(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <h1
            className="text-xl font-semibold cursor-pointer hover:text-primary transition-colors"
            onClick={() => setIsEditingTitle(true)}
          >
            {title}
          </h1>
        )}
      </div>

      <Button
        disabled={isSaving || !hasUnsavedChanges}
        onClick={onSave}
        className="gap-2"
      >
        <Save className="h-4 w-4" />
        {isSaving ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
}
