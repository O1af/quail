import React, { useEffect } from "react";
import Link from "next/link";
import {
  Share2,
  PencilRuler,
  Save,
  X,
  LayoutGrid,
  ArrowLeft,
} from "lucide-react";
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
import { PermissionBadge } from "./PermissionBadge";

interface HeaderControlsProps {
  dashboard: Dashboard | null;
  isEditing: boolean;
  tempTitle: string;
  tempDescription: string;
  userPermission: string | null;
  user: any;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  handleTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDescriptionChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  setIsShareModalOpen: (open: boolean) => void;
  setIsManageChartsOpen: (open: boolean) => void;
  handleEdit: () => void;
  handleSave: () => Promise<void>;
  handleCancel: () => void;
}

export const HeaderControls: React.FC<HeaderControlsProps> = ({
  dashboard,
  isEditing,
  tempTitle,
  tempDescription,
  userPermission,
  user,
  hasUnsavedChanges,
  isSaving,
  handleTitleChange,
  handleDescriptionChange,
  setIsShareModalOpen,
  setIsManageChartsOpen,
  handleEdit,
  handleSave,
  handleCancel,
}) => {
  const { setHeaderContent, setHeaderButtons } = useHeader();

  useEffect(() => {
    setHeaderContent(
      <div className="flex flex-col w-full max-w-full px-2">
        {/* Title area with more horizontal space */}
        <div className="w-full py-1">
          <TitleEditor
            isEditing={isEditing}
            title={dashboard?.title || "Dashboard"}
            description={dashboard?.description || ""}
            tempTitle={tempTitle}
            tempDescription={tempDescription}
            onTitleChange={handleTitleChange}
            onDescriptionChange={handleDescriptionChange}
          />
        </div>
      </div>
    );

    setHeaderButtons(
      <div className="flex items-center justify-between">
        {/* Back button */}
        <div className="flex items-center">
          <Link href="/dashboards" passHref>
            <Button variant="ghost" size="sm" className="mr-2">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Dashboards
            </Button>
          </Link>

          {/* Existing title and editing controls */}
          <div className="flex items-center gap-2">
            {dashboard && user && (
              <>
                {/* Edit Mode Controls */}
                {isEditing ? (
                  <>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsManageChartsOpen(true)}
                          >
                            <LayoutGrid className="h-4 w-4 mr-2" />
                            Charts
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Add or remove charts</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <Button variant="outline" size="sm" onClick={handleCancel}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>

                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleSave}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>Saving...</>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <>
                    {/* View Mode Controls */}
                    {(userPermission === "owner" ||
                      userPermission === "editor") && (
                      <Button variant="outline" size="sm" onClick={handleEdit}>
                        <PencilRuler className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    )}

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
              </>
            )}
          </div>
        </div>
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
    isSaving,
    handleTitleChange,
    handleDescriptionChange,
    handleEdit,
    handleSave,
    handleCancel,
    setIsShareModalOpen,
    setIsManageChartsOpen,
  ]);

  return null;
};
