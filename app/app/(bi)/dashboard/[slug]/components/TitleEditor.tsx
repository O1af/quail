import React, { useRef, useEffect, memo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "recharts";

interface TitleEditorProps {
  isEditing: boolean;
  title: string;
  description: string;
  tempTitle: string;
  tempDescription: string;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDescriptionChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const TitleEditor = memo(
  ({
    isEditing,
    title,
    description,
    tempTitle,
    tempDescription,
    onTitleChange,
    onDescriptionChange,
  }: TitleEditorProps) => {
    const titleInputRef = useRef<HTMLInputElement>(null);
    const descriptionInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      if (isEditing && titleInputRef.current) {
        titleInputRef.current.focus();
      }
    }, [isEditing]);

    console.log("Title editor rendering");

    return isEditing ? (
      <div className="flex flex-col max-w-2xl">
        <div className="grid grid-cols-2 gap-x-4">
          <div>
            <Input
              id="dashboard-title"
              ref={titleInputRef}
              type="text"
              value={tempTitle}
              onChange={onTitleChange}
              className="text-lg font-medium w-full"
              placeholder="Enter dashboard title"
            />
          </div>
          <div>
            <Input
              id="dashboard-description"
              ref={descriptionInputRef}
              type="text"
              value={tempDescription}
              onChange={(e) => onDescriptionChange(e as any)} // Cast to expected type
              className="w-full"
              placeholder="Add a description"
            />
          </div>
        </div>
      </div>
    ) : (
      <div>
        <div className="max-w-2xl flex items-baseline gap-x-3">
          <h1 className="text-2xl font-bold flex-shrink-0">
            {title || "Dashboard"}
          </h1>
        </div>
        <div>
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-1 overflow-hidden overflow-ellipsis">
              {description}
            </p>
          )}
        </div>
      </div>
    );
  }
);

TitleEditor.displayName = "TitleEditor";
