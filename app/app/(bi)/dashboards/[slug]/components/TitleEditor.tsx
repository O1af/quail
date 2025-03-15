import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface TitleEditorProps {
  isEditing: boolean;
  title: string;
  description: string;
  tempTitle: string;
  tempDescription: string;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDescriptionChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const TitleEditor: React.FC<TitleEditorProps> = ({
  isEditing,
  title,
  description,
  tempTitle,
  tempDescription,
  onTitleChange,
  onDescriptionChange,
}) => {
  return (
    <div className="flex flex-col w-full overflow-hidden">
      {isEditing ? (
        <>
          <Input
            value={tempTitle}
            onChange={onTitleChange}
            placeholder="Dashboard Title"
            className="border-none pl-0 text-xl font-medium bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Textarea
            value={tempDescription}
            onChange={onDescriptionChange}
            placeholder="Add a description (optional)"
            className="border-none resize-none pl-0 text-sm text-muted-foreground bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </>
      ) : (
        <>
          <h1 className="text-xl font-medium pr-1 overflow-hidden text-ellipsis whitespace-nowrap">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-muted-foreground overflow-hidden text-ellipsis line-clamp-2">
              {description}
            </p>
          )}
        </>
      )}
    </div>
  );
};

TitleEditor.displayName = "TitleEditor";
