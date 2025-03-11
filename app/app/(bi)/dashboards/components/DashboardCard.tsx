import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Clock,
  LayoutDashboard,
  MoreVertical,
  Check,
  X,
  Loader2,
} from "lucide-react";
import {
  Dashboard,
  updateDashboard,
  createDashboard,
  deleteDashboard,
} from "@/components/stores/dashboard_store";
import { formatDistanceToNow } from "date-fns";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

interface DashboardCardProps {
  dashboard: Dashboard;
  viewMode: "grid" | "list";
  onRefresh?: () => void;
}

export function DashboardCard({
  dashboard,
  viewMode,
  onRefresh,
}: DashboardCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(dashboard.title);
  const [isSaving, setIsSaving] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const router = useRouter();

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUser(data.user);
    };

    getUser();
  }, [supabase]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const startEditing = () => {
    setIsEditing(true);
  };

  const handleDuplicate = async () => {
    if (!currentUser) {
      toast.error("You must be logged in to duplicate dashboards");
      return;
    }

    setIsDuplicating(true);
    try {
      // Create a copy with the same properties
      const newDashboard = await createDashboard({
        userId: currentUser.id,
        title: `${dashboard.title} (Copy)`,
        charts: dashboard.charts || [],
        layout: dashboard.layout || [],
        description: dashboard.description,
      });

      if (newDashboard) {
        toast.success("Dashboard duplicated successfully");

        // Dispatch a custom event to notify parent components
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("dashboard-duplicated", { detail: newDashboard })
          );
        }

        // Refresh the dashboard list
        if (onRefresh) {
          onRefresh();
        }
      } else {
        toast.error("Failed to duplicate dashboard");
      }
    } catch (error) {
      console.error("Failed to duplicate dashboard:", error);
      toast.error("Failed to duplicate dashboard");
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleSave = async () => {
    if (!currentUser) {
      toast.error("You must be logged in to edit dashboards");
      return;
    }

    setIsSaving(true);

    try {
      await updateDashboard(dashboard._id, currentUser.id, {
        title: title.trim() || "Dashboard",
      });

      toast.success("Dashboard title updated");
      setIsEditing(false);

      // Refresh the dashboard list
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error("Failed to update dashboard title:", error);
      toast.error("Failed to update dashboard title");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!currentUser) {
      toast.error("You must be logged in to delete dashboards");
      return;
    }

    setIsDeleting(true);

    try {
      const success = await deleteDashboard(dashboard._id, currentUser.id);

      if (success) {
        toast.success("Dashboard deleted successfully");

        // Refresh the dashboard list
        if (onRefresh) {
          onRefresh();
        }
      } else {
        toast.error("Failed to delete dashboard");
      }
    } catch (error) {
      console.error("Failed to delete dashboard:", error);
      toast.error("Failed to delete dashboard");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setTitle(dashboard.title); // Reset to original title
    setIsEditing(false);
  };

  // Prevent navigation when editing
  const handleCardClick = (e: React.MouseEvent) => {
    if (isEditing) {
      e.preventDefault();
    }
  };

  // Format the updated date
  const formatDate = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  if (viewMode === "grid") {
    return (
      <Card className="transition-all hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2 flex-grow">
            <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
            {isEditing ? (
              <Input
                ref={inputRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-7 py-0 px-2 text-sm font-medium"
                disabled={isSaving}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isSaving) {
                    handleSave();
                  } else if (e.key === "Escape") {
                    handleCancel();
                  }
                }}
              />
            ) : (
              <Link
                href={`/dashboard/${dashboard._id}`}
                onClick={handleCardClick}
                className="flex-grow"
              >
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
              </Link>
            )}
          </div>
          {isEditing ? (
            <div className="flex space-x-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={handleCancel}
                disabled={isSaving}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="opacity-100">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={startEditing}>
                  Edit Title
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDuplicate}
                  disabled={isDuplicating}
                >
                  {isDuplicating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Duplicating...
                    </>
                  ) : (
                    <>Duplicate</>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>Delete</>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <div>
              {dashboard.charts?.length || 0} chart
              {dashboard.charts?.length !== 1 ? "s" : ""}
            </div>
            <div>•</div>
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>Updated {formatDate(dashboard.updatedAt)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // List view
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/5 transition-colors">
      <div className="flex items-center space-x-3 flex-1">
        <LayoutDashboard className="h-5 w-5 flex-shrink-0" />
        <div className="flex-grow">
          {isEditing ? (
            <Input
              ref={inputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-7 py-0 px-2 text-sm font-medium"
              disabled={isSaving}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isSaving) {
                  handleSave();
                } else if (e.key === "Escape") {
                  handleCancel();
                }
              }}
            />
          ) : (
            <Link
              href={`/dashboard/${dashboard._id}`}
              onClick={handleCardClick}
              className="block"
            >
              <h3 className="text-sm font-medium">{title}</h3>
              <p className="text-xs text-muted-foreground">
                {dashboard.charts?.length || 0} chart
                {dashboard.charts?.length !== 1 ? "s" : ""} • Updated{" "}
                {formatDate(dashboard.updatedAt)}
              </p>
            </Link>
          )}
        </div>
      </div>
      {isEditing ? (
        <div className="flex space-x-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={handleCancel}
            disabled={isSaving}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="opacity-100">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={startEditing}>
                Edit Name
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDuplicate}
                disabled={isDuplicating}
              >
                {isDuplicating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Duplicating...
                  </>
                ) : (
                  <>Duplicate</>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>Delete</>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}
