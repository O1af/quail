import React, { useRef, useEffect, memo } from "react";
import { Input } from "@/components/ui/input";

interface TitleEditorProps {
  isEditing: boolean;
  title: string;
  tempTitle: string;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const TitleEditor = memo(
  ({ isEditing, title, tempTitle, onTitleChange }: TitleEditorProps) => {
    const titleInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      if (isEditing && titleInputRef.current) {
        titleInputRef.current.focus();
      }
    }, [isEditing]);

    console.log("Title editor rendering");

    return isEditing ? (
      <Input
        ref={titleInputRef}
        type="text"
        value={tempTitle}
        onChange={onTitleChange}
        className="text-2xl font-bold h-auto py-1"
        placeholder="Dashboard Title"
      />
    ) : (
      <h1 className="text-2xl font-bold">{title || "Dashboard"}</h1>
    );
  }
);

TitleEditor.displayName = "TitleEditor";
