import { useState, useEffect } from "react";
import { toast } from "sonner";
import { createDashboard } from "@/components/stores/dashboard_store";
import { listCharts } from "@/components/stores/chart_store";

// UI Components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2, X, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChartDocument } from "@/lib/types/stores/chart";

interface Chart {
  _id: string;
  title: string;
  data?: {
    chartType?: string;
  };
  updatedAt?: Date;
}

interface CreateDashboardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDashboardCreated: () => void;
  userId: string;
}

export function CreateDashboardDialog({
  open,
  onOpenChange,
  onDashboardCreated,
  userId,
}: CreateDashboardDialogProps) {
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCharts, setSelectedCharts] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoadingCharts, setIsLoadingCharts] = useState(false);
  const [availableCharts, setAvailableCharts] = useState<
    Pick<ChartDocument, "title" | "_id" | "updatedAt" | "data">[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Fetch user's charts when the dialog opens and userId is available
  useEffect(() => {
    const fetchCharts = async () => {
      if (open && userId) {
        setIsLoadingCharts(true);
        try {
          const charts = await listCharts(userId);
          setAvailableCharts(charts || []);
        } catch (error) {
          console.error("Failed to load charts:", error);
          toast.error("Failed to load your charts");
        } finally {
          setIsLoadingCharts(false);
        }
      }
    };

    fetchCharts();
  }, [open, userId]);

  // Reset form fields
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setSelectedCharts([]);
    setSearchQuery("");
    setIsDropdownOpen(false);
  };

  // Handle form submission
  const handleCreateDashboard = async () => {
    if (!title.trim()) {
      toast.error("Please enter a dashboard title");
      return;
    }

    if (!userId) {
      toast.error("You must be logged in to create a dashboard");
      return;
    }

    setIsCreating(true);
    try {
      const newDashboard = await createDashboard({
        userId,
        title: title.trim(),
        description: description.trim() || undefined,
        charts: selectedCharts,
        layout: [],
      });

      if (newDashboard) {
        toast.success("Dashboard created successfully");
        resetForm();
        onOpenChange(false);
        onDashboardCreated();
      } else {
        toast.error("Failed to create dashboard");
      }
    } catch (error) {
      console.error("Failed to create dashboard:", error);
      toast.error("Failed to create dashboard");
    } finally {
      setIsCreating(false);
    }
  };

  // Filter charts based on search query
  const filteredCharts = searchQuery.trim()
    ? availableCharts.filter((chart) =>
        chart.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : availableCharts;

  // Handle chart selection
  const handleChartSelection = (chartId: string) => {
    const isSelected = selectedCharts.includes(chartId);
    if (isSelected) {
      setSelectedCharts(selectedCharts.filter((id) => id !== chartId));
    } else {
      setSelectedCharts([...selectedCharts, chartId]);
    }
  };

  // Toggle all visible charts selection
  const toggleSelectAll = () => {
    if (filteredCharts.length === 0) return;

    // Check if all filtered charts are already selected
    const allSelected = filteredCharts.every((chart) =>
      selectedCharts.includes(chart._id)
    );

    if (allSelected) {
      // Deselect all filtered charts
      setSelectedCharts(
        selectedCharts.filter(
          (id) => !filteredCharts.some((chart) => chart._id === id)
        )
      );
    } else {
      // Select all filtered charts
      const filteredIds = filteredCharts.map((chart) => chart._id);
      const newSelected = [...new Set([...selectedCharts, ...filteredIds])];
      setSelectedCharts(newSelected);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        onOpenChange(newOpen);
        if (!newOpen) resetForm();
      }}
    >
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Dashboard</DialogTitle>
          <DialogDescription>
            Create a dashboard to organize and display your charts.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Dashboard Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Dashboard"
              autoFocus
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Dashboard description..."
              className="resize-none"
            />
          </div>
          <div className="grid gap-2">
            <Label>Select Charts</Label>

            {/* Multi-select input */}
            <div className="relative">
              {/* Input field and dropdown trigger */}
              <div
                className={cn(
                  "flex items-center justify-between w-full border rounded-md px-3 py-2 text-sm",
                  isDropdownOpen ? "border-primary" : "border-input",
                  isLoadingCharts && "opacity-70"
                )}
                onClick={() =>
                  !isLoadingCharts && setIsDropdownOpen(!isDropdownOpen)
                }
              >
                <div className="flex-1 flex items-center gap-1">
                  {isLoadingCharts ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      <span className="text-muted-foreground">
                        Loading charts...
                      </span>
                    </>
                  ) : selectedCharts.length > 0 ? (
                    <span>
                      {selectedCharts.length} chart
                      {selectedCharts.length === 1 ? "" : "s"} selected
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      Select charts...
                    </span>
                  )}
                </div>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 opacity-50 transition-transform",
                    isDropdownOpen && "transform rotate-180"
                  )}
                />
              </div>

              {/* Dropdown menu */}
              {isDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-md">
                  <div className="p-2 border-b">
                    <div className="flex items-center border rounded-md bg-background">
                      <Search className="h-4 w-4 mx-2 text-muted-foreground" />
                      <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search charts..."
                        className="flex h-9 w-full bg-transparent py-2 text-sm outline-hidden placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <ScrollArea className="h-[240px]">
                    {filteredCharts.length > 0 ? (
                      <>
                        <div
                          className="px-3 py-2 text-sm cursor-pointer hover:bg-accent flex items-center"
                          onClick={toggleSelectAll}
                        >
                          <input
                            type="checkbox"
                            className="mr-2"
                            checked={filteredCharts.every((chart) =>
                              selectedCharts.includes(chart._id)
                            )}
                            readOnly
                          />
                          <span className="font-medium">
                            {filteredCharts.every((chart) =>
                              selectedCharts.includes(chart._id)
                            )
                              ? "Deselect all"
                              : "Select all"}
                          </span>
                        </div>
                        <div className="border-t"></div>
                        {filteredCharts.map((chart) => (
                          <div
                            key={chart._id}
                            className="px-3 py-2 text-sm cursor-pointer hover:bg-accent flex items-center"
                            onClick={() => handleChartSelection(chart._id)}
                          >
                            <input
                              type="checkbox"
                              className="mr-2"
                              checked={selectedCharts.includes(chart._id)}
                              readOnly
                            />
                            <div className="flex flex-col">
                              <span>{chart.title}</span>
                              {/* {chart.data?.chartType && (
                                <span className="text-xs text-muted-foreground">
                                  {chart.data.chartType} chart
                                </span>
                              )} */}
                            </div>
                          </div>
                        ))}
                      </>
                    ) : searchQuery ? (
                      <p className="text-center py-4 text-muted-foreground">
                        No charts match your search
                      </p>
                    ) : (
                      <p className="text-center py-4 text-muted-foreground">
                        No charts available
                      </p>
                    )}
                  </ScrollArea>

                  <div className="p-2 border-t flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      {selectedCharts.length} selected
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Done
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Selected charts badges */}
            {selectedCharts.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedCharts.map((chartId) => {
                  const chart = availableCharts.find((c) => c._id === chartId);
                  return chart ? (
                    <Badge
                      key={chartId}
                      variant="secondary"
                      className="pl-2 pr-1 py-0"
                    >
                      {chart.title}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 ml-1 hover:bg-destructive/20"
                        onClick={() => handleChartSelection(chart._id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ) : null;
                })}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateDashboard} disabled={isCreating}>
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Dashboard"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
