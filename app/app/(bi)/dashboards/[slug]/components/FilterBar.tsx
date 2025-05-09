import React, { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  X,
  Clock,
  Tag,
  Globe,
  BarChart,
  Database,
  Calendar as CalendarIcon,
  Search,
  Filter,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Filter {
  id: string;
  name: string;
  value: string;
}

interface FilterBarProps {
  filters: Filter[];
  activeFilters: Filter[];
  onFilterChange: (filters: Filter[]) => void;
}

interface DateRange {
  from: Date | undefined;
  to?: Date | undefined;
}

interface DateRangeFilterProps {
  dateRange: DateRange;
  onDateRangeChange: (dateRange: DateRange) => void;
}

// Add KeywordFilter component
interface KeywordFilterProps {
  keyword: string;
  onKeywordChange: (keyword: string) => void;
}

export const KeywordFilter: React.FC<KeywordFilterProps> = ({
  keyword,
  onKeywordChange,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    onKeywordChange("");
  };

  return (
    <div className="relative flex-1 min-w-[240px]">
      <div
        className={`relative flex items-center rounded-md border ${
          keyword
            ? "border-primary"
            : isFocused
            ? "ring-2 ring-ring"
            : "border-input"
        }`}
      >
        <Search className="absolute left-2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Keyword Filter"
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`pl-8 border-0 focus-visible:ring-0 ${
            keyword ? "text-primary" : ""
          }`}
        />
        {keyword && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-0 h-full px-2"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {keyword && (
        <div className="mt-1 text-xs text-muted-foreground">
          Searching with fuzzy matching (like Elasticsearch)
        </div>
      )}
    </div>
  );
};

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  dateRange,
  onDateRangeChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Clear date range
  const handleClear = () => {
    onDateRangeChange({ from: undefined, to: undefined });
    setIsOpen(false);
  };

  // Format date range for display
  const formatDateRange = () => {
    if (!dateRange.from) return "Filter by date";

    if (!dateRange.to) {
      return `From ${format(dateRange.from, "PPP")}`;
    }

    return `${format(dateRange.from, "PPP")} - ${format(dateRange.to, "PPP")}`;
  };

  // Predefined date ranges for quick selection
  const predefinedRanges = [
    {
      label: "Last 7 days",
      action: () => {
        const to = new Date();
        const from = new Date();
        from.setDate(to.getDate() - 7);
        onDateRangeChange({ from, to });
      },
    },
    {
      label: "Last 30 days",
      action: () => {
        const to = new Date();
        const from = new Date();
        from.setDate(to.getDate() - 30);
        onDateRangeChange({ from, to });
      },
    },
    {
      label: "This month",
      action: () => {
        const to = new Date();
        const from = new Date(to.getFullYear(), to.getMonth(), 1);
        onDateRangeChange({ from, to });
      },
    },
    {
      label: "Last month",
      action: () => {
        const to = new Date();
        to.setDate(0); // Last day of previous month
        const from = new Date(to.getFullYear(), to.getMonth(), 1);
        onDateRangeChange({ from, to });
      },
    },
    {
      label: "This year",
      action: () => {
        const to = new Date();
        const from = new Date(to.getFullYear(), 0, 1);
        onDateRangeChange({ from, to });
      },
    },
  ];

  return (
    <div className="p-2 bg-card rounded-lg shadow-xs">
      <div className="flex items-center flex-wrap gap-2">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal",
                dateRange.from &&
                  "border-primary text-primary hover:text-primary hover:bg-primary/5"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formatDateRange()}
              {dateRange.from && (
                <X
                  className="h-3 w-3 ml-2 cursor-pointer hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-3 space-y-3">
              <div className="flex flex-wrap gap-2">
                {predefinedRanges.map((range) => (
                  <Button
                    key={range.label}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      range.action();
                      setIsOpen(false);
                    }}
                    className="text-xs"
                  >
                    {range.label}
                  </Button>
                ))}
              </div>
              <Calendar
                mode="range"
                selected={{
                  from: dateRange.from,
                  to: dateRange.to,
                }}
                onSelect={(selectedRange) => {
                  onDateRangeChange(
                    selectedRange || { from: undefined, to: undefined }
                  );
                }}
                numberOfMonths={2}
                initialFocus
              />
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="text-xs"
                >
                  <X className="mr-2 h-3 w-3" />
                  Clear
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

// New FilterDialog component
interface FilterDialogProps extends DateRangeFilterProps, KeywordFilterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FilterDialog: React.FC<FilterDialogProps> = ({
  open,
  onOpenChange,
  dateRange,
  onDateRangeChange,
  keyword,
  onKeywordChange,
}) => {
  // Create a local state for filters to allow confirmation/cancellation
  const [localDateRange, setLocalDateRange] = useState<DateRange>(dateRange);
  const [localKeyword, setLocalKeyword] = useState(keyword);

  // Update local state when props change (when dialog opens)
  React.useEffect(() => {
    if (open) {
      setLocalDateRange(dateRange);
      setLocalKeyword(keyword);
    }
  }, [open, dateRange, keyword]);

  // Apply filters and close dialog
  const handleApply = () => {
    onDateRangeChange(localDateRange);
    onKeywordChange(localKeyword);
    onOpenChange(false);
  };

  // Reset local filters to match the applied filters
  const handleCancel = () => {
    setLocalDateRange(dateRange);
    setLocalKeyword(keyword);
    onOpenChange(false);
  };

  // Clear all filters
  const handleClearAll = () => {
    setLocalDateRange({ from: undefined, to: undefined });
    setLocalKeyword("");
  };

  // Check if any filter is active
  const hasActiveFilters =
    localDateRange.from || localKeyword.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] md:max-w-[800px] w-[40vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Dashboard Filters
          </DialogTitle>
          <DialogDescription>
            Filter charts by date range or keywords
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-6">
          {/* Date Range Filter Section */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="text-sm font-medium mb-4 flex items-center">
              <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
              Date Range
            </h4>
            <div className="grid gap-4">
              <div className="flex flex-wrap gap-2 pb-2 bg-card p-2 rounded-md">
                {/* Predefined date ranges */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const to = new Date();
                    const from = new Date();
                    from.setDate(to.getDate() - 7);
                    setLocalDateRange({ from, to });
                  }}
                >
                  Last 7 days
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const to = new Date();
                    const from = new Date();
                    from.setDate(to.getDate() - 30);
                    setLocalDateRange({ from, to });
                  }}
                >
                  Last 30 days
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const to = new Date();
                    const from = new Date(to.getFullYear(), to.getMonth(), 1);
                    setLocalDateRange({ from, to });
                  }}
                >
                  This month
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const to = new Date();
                    to.setDate(0); // Last day of previous month
                    const from = new Date(to.getFullYear(), to.getMonth(), 1);
                    setLocalDateRange({ from, to });
                  }}
                >
                  Last month
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const to = new Date();
                    const from = new Date(to.getFullYear(), 0, 1);
                    setLocalDateRange({ from, to });
                  }}
                >
                  This year
                </Button>
              </div>

              {/* Calendar - Make responsive */}
              <div className="w-full overflow-x-auto pb-2 bg-card p-2 rounded-md">
                <div className="min-w-[600px] md:min-w-0">
                  <Calendar
                    mode="range"
                    selected={localDateRange}
                    onSelect={(range) =>
                      setLocalDateRange(
                        range
                          ? { from: range.from, to: range.to }
                          : { from: undefined, to: undefined }
                      )
                    }
                    numberOfMonths={2}
                    className="rounded-md border mx-auto"
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator className="bg-border" />

          {/* Keyword Filter Section */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="text-sm font-medium mb-4 flex items-center">
              <Search className="h-4 w-4 mr-2 text-muted-foreground" />
              Keyword Search
            </h4>
            <div className="grid gap-2 bg-card p-2 rounded-md">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search in chart data..."
                  value={localKeyword}
                  onChange={(e) => setLocalKeyword(e.target.value)}
                  className="pl-8"
                />
                {localKeyword && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setLocalKeyword("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                Uses fuzzy matching to find results even with typos
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between mt-4 pt-4 border-t">
          <div>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={handleClearAll}>
                Clear all filters
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleApply}>
              Apply Filters
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  activeFilters,
  onFilterChange,
}) => {
  // Group filters by their name for better organization
  const filterGroups = useMemo(() => {
    const groups: { [key: string]: Filter[] } = {};

    filters.forEach((filter) => {
      if (!groups[filter.name]) {
        groups[filter.name] = [];
      }
      groups[filter.name].push(filter);
    });

    return groups;
  }, [filters]);

  // Get filter icon based on filter name
  const getFilterIcon = (groupName: string) => {
    switch (groupName.toLowerCase()) {
      case "chart age":
        return <Clock className="h-3 w-3 mr-1" />;
      case "chart type":
        return <BarChart className="h-3 w-3 mr-1" />;
      case "data source":
        return <Database className="h-3 w-3 mr-1" />;
      case "time period":
        return <Clock className="h-3 w-3 mr-1" />;
      case "status":
        return <Tag className="h-3 w-3 mr-1" />;
      case "region":
        return <Globe className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  // Check if a filter is active
  const isFilterActive = useCallback(
    (filter: Filter) => {
      return activeFilters.some(
        (activeFilter) =>
          activeFilter.id === filter.id && activeFilter.value === filter.value
      );
    },
    [activeFilters]
  );

  // Toggle a filter
  const toggleFilter = useCallback(
    (filter: Filter) => {
      const isActive = isFilterActive(filter);
      let newFilters: Filter[];

      if (isActive) {
        // Remove filter if it's active
        newFilters = activeFilters.filter(
          (activeFilter) =>
            !(
              activeFilter.id === filter.id &&
              activeFilter.value === filter.value
            )
        );
      } else {
        // Add filter if it's not active
        newFilters = [
          // Remove any existing filter with the same ID (to ensure only one value per filter)
          ...activeFilters.filter(
            (activeFilter) => activeFilter.id !== filter.id
          ),
          filter,
        ];
      }

      onFilterChange(newFilters);
    },
    [activeFilters, isFilterActive, onFilterChange]
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    onFilterChange([]);
  }, [onFilterChange]);

  // Only render if there are filters to show
  if (Object.keys(filterGroups).length === 0) {
    return null;
  }

  return (
    <div className="p-2 bg-background border border-border rounded-lg shadow-sm">
      <div className="flex items-center flex-wrap gap-2">
        {Object.entries(filterGroups).map(([groupName, groupFilters]) => (
          <div key={groupName} className="flex flex-col gap-1">
            <div className="text-sm font-medium flex items-center">
              {getFilterIcon(groupName)}
              {groupName}
            </div>
            <div className="flex flex-wrap gap-1">
              {groupFilters.map((filter) => (
                <Button
                  key={`${filter.id}-${filter.value}`}
                  variant={isFilterActive(filter) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleFilter(filter)}
                  className="text-xs"
                >
                  {filter.value}
                </Button>
              ))}
            </div>
          </div>
        ))}

        {activeFilters.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="ml-2"
          >
            <X className="h-3 w-3 mr-1" />
            Clear filters
          </Button>
        )}
      </div>

      {activeFilters.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          <span className="text-xs text-muted-foreground mr-1">
            Active filters:
          </span>
          {activeFilters.map((filter) => (
            <Badge
              key={`active-${filter.id}-${filter.value}`}
              variant="secondary"
              className="text-xs"
            >
              {filter.name}: {filter.value}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => toggleFilter(filter)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
