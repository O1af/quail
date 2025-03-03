import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BarChart,
  Asterisk,
  Clock,
  LineChart,
  MoreVertical,
  PieChart,
  Pin,
  PinOff,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { ChartCardProps } from "../types";
import { updateChartTitle, loadChart } from "@/lib/actions/chartActions";
import { createChart } from "@/components/stores/dashboard_store";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

// Import event emitter for communication without props
import mitt from "next/dist/shared/lib/mitt";

// Create a global event emitter
const emitter = mitt();

export function ChartCard({
  id,
  title,
  type,
  link,
  viewMode,
  pinned,
  onPin,
}: ChartCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [displayTitle, setDisplayTitle] = useState(title); // Local state to store the displayed title
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  // Update local title when prop title changes
  useEffect(() => {
    setDisplayTitle(title);
    setEditedTitle(title);
  }, [title]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Handle duplicate
  const handleDuplicate = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setIsDuplicating(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("You must be logged in to duplicate charts");
        return;
      }

      try {
        // Load the original chart using our server action directly
        const originalChart = await loadChart(user.id, id);

        if (!originalChart) {
          toast.error("Failed to find chart to duplicate");
          return;
        }

        // Create new chart with the original data
        const newChart = await createChart({
          userId: user.id,
          title: `${displayTitle} (Copy)`,
          type: originalChart.type,
          query: originalChart.query,
          visualization: originalChart.visualization,
          description: originalChart.description,
        });

        if (newChart) {
          toast.success("Chart duplicated successfully");

          // Emit event for parent components
          emitter.emit("chart-duplicated", newChart);
        } else {
          toast.error("Failed to duplicate chart");
        }
      } catch (error) {
        console.error("Error in chart duplication:", error);
        toast.error("Failed to duplicate chart");
      }
    } finally {
      setIsDuplicating(false);
    }
  };

  // Handle edit button click
  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditedTitle(displayTitle);
    setIsEditing(true);
  };

  // Save the edited title
  const handleSave = async () => {
    const finalTitle = editedTitle.trim() || "Untitled Chart";

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to edit charts");
        setIsEditing(false);
        return;
      }

      const success = await updateChartTitle(id, user.id, finalTitle);
      if (success) {
        // Update local state immediately for a responsive feel
        setDisplayTitle(finalTitle);

        // Emit an event to notify parent components
        emitter.emit("chart-title-changed", { id, title: finalTitle });

        toast.success("Chart title updated");
      } else {
        toast.error("Failed to update chart title");
        // Reset to the original title on failure
        setEditedTitle(displayTitle);
      }
    } catch (error) {
      console.error("Failed to update chart title:", error);
      toast.error("Failed to update chart title");
      setEditedTitle(displayTitle);
    } finally {
      setIsEditing(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setEditedTitle(displayTitle);
    setIsEditing(false);
  };

  // Prevent clicks from navigating when editing
  const handleCardClick = (e: React.MouseEvent) => {
    if (isEditing) {
      e.preventDefault();
    }
  };

  // Prevent propagation for input clicks
  const handleInputClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  if (viewMode === "grid") {
    return (
      <Link href={`/chart/${id}`} className="group" onClick={handleCardClick}>
        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              {(() => {
                switch (type) {
                  case "bar":
                    return <BarChart className="h-4 w-4" />;
                  case "line":
                    return <LineChart className="h-4 w-4" />;
                  case "pie":
                    return <PieChart className="h-4 w-4" />;
                  default:
                    return <Asterisk className="h-4 w-4" />;
                }
              })()}
              {isEditing ? (
                <Input
                  ref={inputRef}
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onClick={handleInputClick}
                  className="h-7 py-0 px-2 text-sm font-medium"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSave();
                    if (e.key === "Escape") handleCancel();
                  }}
                />
              ) : (
                <CardTitle className="text-sm font-medium">
                  {displayTitle}
                </CardTitle>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSave();
                    }}
                    className="h-6 w-6"
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleCancel();
                    }}
                    className="h-6 w-6"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.preventDefault();
                      onPin(id);
                    }}
                    title={pinned ? "Unpin" : "Pin"}
                  >
                    {pinned ? (
                      <Pin className="h-4 w-4 text-yellow-500" />
                    ) : (
                      <PinOff className="h-4 w-4" />
                    )}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-100 transition-opacity"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleEditClick}>
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
                      <DropdownMenuItem className="text-destructive">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <div>{type}</div>
              <div>•</div>
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>Updated recently</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  // List view
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/5 transition-colors">
      <div className="flex items-center space-x-3 flex-1">
        {(() => {
          switch (type) {
            case "bar":
              return <BarChart className="h-4 w-4" />;
            case "line":
              return <LineChart className="h-4 w-4" />;
            case "pie":
              return <PieChart className="h-4 w-4" />;
            default:
              return <Asterisk className="h-4 w-4" />;
          }
        })()}
        {isEditing ? (
          <div className="flex-1">
            <Input
              ref={inputRef}
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onClick={handleInputClick}
              className="h-7 py-0 px-2 text-sm font-medium mb-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") handleCancel();
              }}
            />
            <p className="text-xs text-muted-foreground">
              {type} • Updated recently
            </p>
          </div>
        ) : (
          <Link
            href={`/chart/${id}`}
            className="flex-1"
            onClick={handleCardClick}
          >
            <h3 className="text-sm font-medium">{displayTitle}</h3>
            <p className="text-xs text-muted-foreground">
              {type} • Updated recently
            </p>
          </Link>
        )}
      </div>

      {isEditing ? (
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleSave}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleCancel}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.preventDefault();
              onPin(id);
            }}
            title={pinned ? "Unpin" : "Pin"}
          >
            {pinned ? (
              <Pin className="h-4 w-4 text-yellow-500" />
            ) : (
              <PinOff className="h-4 w-4" />
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="opacity-100">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEditClick}>
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
              <DropdownMenuItem className="text-destructive">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}

// Export event emitter to allow parent components to listen for events
export const chartEvents = emitter;
