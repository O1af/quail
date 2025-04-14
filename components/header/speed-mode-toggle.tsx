"use client";
import { Gauge, Zap, Clock } from "lucide-react"; // Removed Loader as it wasn't used
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTableStore, type SpeedMode } from "@/components/stores/table_store";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

const speedModeInfo = {
  fast: {
    label: "Fast",
    description: "Quick analysis", // Updated description
    icon: Zap,
    color: "text-amber-500",
    bgColor: "bg-amber-500",
  },
  medium: {
    label: "Balanced", // Changed label for clarity
    description: "Balanced speed & accuracy", // Updated description
    icon: Gauge,
    color: "text-blue-500",
    bgColor: "bg-blue-500",
  },
  slow: {
    label: "Accurate", // Changed label for clarity
    description: "Precise analysis", // Updated description
    icon: Clock,
    color: "text-green-500",
    bgColor: "bg-green-500",
  },
};

export function SpeedModeToggle() {
  // Use separate selectors to avoid unnecessary rerenders
  const speedMode = useTableStore((state) => state.speedMode);
  const setSpeedMode = useTableStore((state) => state.setSpeedMode);

  // Memoize the current info to prevent recalculations
  const currentInfo = useMemo(() => speedModeInfo[speedMode], [speedMode]);

  // Icon for the current mode
  const ModeIcon = currentInfo.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="transition-all">
                <ModeIcon className={cn("h-4 w-4", currentInfo.color)} />
              </Button>
            </PopoverTrigger>
            {/* Simplified PopoverContent */}
            <PopoverContent align="end" className="w-60 p-2 shadow-lg">
              {/* Removed header div */}
              {/* Adjusted width */}
              <div className="space-y-1">
                {" "}
                {/* Reduced spacing */}
                {Object.entries(speedModeInfo).map(([mode, info]) => {
                  const Icon = info.icon;
                  const isActive = mode === speedMode;
                  return (
                    <div
                      key={mode}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-md transition-all cursor-pointer", // Combined flex into main div
                        isActive ? "bg-secondary" : "hover:bg-muted"
                      )}
                      onClick={() => setSpeedMode(mode as SpeedMode)}
                    >
                      <div
                        className={cn(
                          "p-1.5 rounded-md",
                          isActive ? info.bgColor : "bg-muted",
                          isActive ? "text-white" : info.color
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{info.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {info.description}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>
        </TooltipTrigger>
        <TooltipContent>
          <p className="flex items-center gap-1.5">
            <ModeIcon className={cn("h-3.5 w-3.5", currentInfo.color)} />
            Response speed: {currentInfo.label}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
