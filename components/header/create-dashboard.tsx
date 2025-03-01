"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CirclePlus } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { createClient } from "@/utils/supabase/client";
import { Chart, loadUserCharts } from "../stores/dashboard_store";
import Select from "react-select";
import { createDashboard } from "../stores/dashboard_store";
import { useTheme } from "next-themes";

export function CreateDashboard() {
  const [open, setOpen] = useState(false);
  const [selectedCharts, setSelectedCharts] = useState<string[]>([]);
  const [availableCharts, setAvailableCharts] = useState<Chart[]>([]);
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = `${process.env.NEXT_PUBLIC_APP_URL}/login`;
        return;
      }

      setUser(user);
    };

    fetchUser();
  }, [supabase]);
  // Fetch available charts when dialog opens
  const [isLoading, setIsLoading] = useState(false);

  const fetchAvailableCharts = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const fetchedCharts = await loadUserCharts(user.id);
      setAvailableCharts(fetchedCharts);
      console.log(availableCharts);
    } catch (error) {
      console.error("Failed to fetch charts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset selections and fetch charts when dialog opens
  useEffect(() => {
    const handleDialogOpen = (isOpen: boolean) => {
      setOpen(isOpen);
      if (isOpen) {
        setSelectedCharts([]);
        fetchAvailableCharts();
        console.log(availableCharts);
      }
    };

    handleDialogOpen(open);
  }, [user, open]);

  return (
    <Dialog open={open}>
      <DialogTrigger asChild>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-muted"
                aria-label="Create dashboard"
                onClick={() => setOpen(true)}
              >
                <CirclePlus className="h-5 w-5" />
                <span className="sr-only">Create dashboard</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Create dashboard</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Dashboard</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="flex justify-center items-center py-4">
            <div className="loader">Loading...</div>
          </div>
        ) : (
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const title = (
                form.elements.namedItem("name") as HTMLInputElement
              )?.value;

              const newDashboard = await createDashboard({
                charts: selectedCharts,
                title,
                userId: user.id,
                layout: [],
              });
              setOpen(false);
            }}
          >
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Dashboard Title
              </label>
              <input
                id="name"
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
                placeholder="Enter dashboard name"
                required
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="charts"
                className="text-sm font-medium text-white"
              >
                Select Charts
              </label>

              <Select
                isMulti
                styles={{
                  control: (baseStyles, state) => ({
                    ...baseStyles,
                    backgroundColor: theme === "dark" ? "#1a1a1a" : "#fff",
                    borderColor: state.isFocused
                      ? theme === "dark"
                        ? "#555"
                        : "#ccc"
                      : theme === "dark"
                      ? "#333"
                      : "#ddd",
                    color: theme === "dark" ? "white" : "black",
                    "&:hover": {
                      borderColor: theme === "dark" ? "#777" : "#bbb",
                    },
                  }),
                  menu: (base) => ({
                    ...base,
                    backgroundColor: theme === "dark" ? "#1a1a1a" : "#fff",
                  }),
                  option: (base, { isFocused, isSelected }) => ({
                    ...base,
                    backgroundColor: isSelected
                      ? theme === "dark"
                        ? "#333"
                        : "#ddd"
                      : isFocused
                      ? theme === "dark"
                        ? "#444"
                        : "#eee"
                      : theme === "dark"
                      ? "#1a1a1a"
                      : "#fff",
                    color: theme === "dark" ? "white" : "black",
                    "&:hover": {
                      backgroundColor: theme === "dark" ? "#555" : "#ccc",
                    },
                  }),
                  singleValue: (base) => ({
                    ...base,
                    color: theme === "dark" ? "white" : "black",
                  }),
                  multiValue: (base) => ({
                    ...base,
                    backgroundColor: theme === "dark" ? "#333" : "#ddd",
                  }),
                  multiValueLabel: (base) => ({
                    ...base,
                    color: theme === "dark" ? "white" : "black",
                  }),
                  multiValueRemove: (base) => ({
                    ...base,
                    color: theme === "dark" ? "#bbb" : "#666",
                    "&:hover": {
                      backgroundColor: theme === "dark" ? "#555" : "#ccc",
                      color: theme === "dark" ? "white" : "black",
                    },
                  }),
                }}
                value={selectedCharts.map((id) => {
                  const chart = availableCharts.find(
                    (chart) => chart._id === id
                  );
                  return {
                    value: id,
                    label: chart?.title || "Untitled Chart",
                  };
                })}
                onChange={(selected) =>
                  setSelectedCharts(
                    selected ? selected.map((option) => option.value) : []
                  )
                }
                options={availableCharts.map((chart) => ({
                  value: chart._id,
                  label: chart.title,
                }))}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                type="button"
              >
                Cancel
              </Button>
              <Button type="submit">Create</Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
