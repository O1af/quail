import React, { useEffect } from "react";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TitleEditor } from "./TitleEditor";
import { useHeader } from "@/components/header/header-context";
import { Dashboard } from "@/components/stores/dashboard_store";

interface HeaderControlsProps {
  dashboard: Dashboard | null;
  isEditing: boolean;
  tempTitle: string;
  tempDescription: string;
  userPermission: string | null;
  user: any;
  hasUnsavedChanges: boolean;
  handleTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDescriptionChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  setIsShareModalOpen: (open: boolean) => void;
}

export const HeaderControls: React.FC<HeaderControlsProps> = ({
  dashboard,
  isEditing,
  tempTitle,
  tempDescription,
  userPermission,
  user,
  hasUnsavedChanges,
  handleTitleChange,
  handleDescriptionChange,
  setIsShareModalOpen,
}) => {
  const { setHeaderContent, setHeaderButtons } = useHeader();

  useEffect(() => {
    setHeaderContent(
      <div className="flex flex-1 justify-between items-center w-full">
        <div className="w-full">
          <TitleEditor
            isEditing={isEditing}
            title={dashboard?.title || "Dashboard"}
            description={dashboard?.description || ""}
            tempTitle={tempTitle}
            tempDescription={tempDescription}
            onTitleChange={(e) => {
              handleTitleChange(e);
            }}
            onDescriptionChange={(e) => {
              handleDescriptionChange(e);
            }}
          />
        </div>
        <div className="ml-4 max-w-lg"></div>
      </div>
    );

    setHeaderButtons(
      <div className="flex items-center gap-2">
        {dashboard && user && (
          <>
            {userPermission === "owner" && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsShareModalOpen(true)}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Share this dashboard with others</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </>
        )}
      </div>
    );

    return () => {
      setHeaderContent(null);
      setHeaderButtons(null);
    };
  }, [
    setHeaderContent,
    setHeaderButtons,
    dashboard,
    isEditing,
    tempTitle,
    tempDescription,
    userPermission,
    user,
    hasUnsavedChanges,
    handleTitleChange,
    handleDescriptionChange,
    setIsShareModalOpen,
  ]);

  return null; // This component only sets header content and doesn't render anything itself
};
