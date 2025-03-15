import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

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
    <div className="w-full">
      {isEditing ? (
        // Edit mode - horizontal layout
        <div className="flex flex-col md:flex-row gap-3 w-full">
          <div className="md:w-1/3 min-w-[200px]">
            <Input
              value={tempTitle}
              onChange={onTitleChange}
              placeholder="Dashboard Title"
              className="text-xl font-medium px-2 border shadow-sm focus-visible:ring-1 bg-background hover:bg-muted/10 rounded-md"
            />
          </div>
          <div className="flex-1">
            <Textarea
              value={tempDescription}
              onChange={onDescriptionChange}
              placeholder="Add a description (optional)"
              rows={1}
              className="min-h-[38px] resize-none text-sm text-muted-foreground px-2 border shadow-sm focus-visible:ring-1 bg-background hover:bg-muted/10 rounded-md py-2"
            />
          </div>
        </div>
      ) : (
        // View mode - title with description tooltip
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-medium">{title}</h1>
          {description && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="inline-flex items-center">
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )}
    </div>
  );
};

TitleEditor.displayName = "TitleEditor";
