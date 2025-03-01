"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  autoFocus?: boolean;
  debounceMs?: number;
  clearable?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function SearchBar({
  placeholder = "Search...",
  value: externalValue,
  onChange,
  className,
  autoFocus = false,
  debounceMs = 300,
  clearable = true,
  onKeyDown,
}: SearchBarProps) {
  const [internalValue, setInternalValue] = useState(externalValue || "");
  const isControlled = externalValue !== undefined;

  // Update internal value when external value changes
  useEffect(() => {
    if (isControlled) {
      setInternalValue(externalValue);
    }
  }, [externalValue, isControlled]);

  // Handle debounced search
  useEffect(() => {
    if (!onChange) return;

    // If it's controlled externally, don't trigger onChange from internal state changes
    if (isControlled) return;

    const handler = setTimeout(() => {
      onChange(internalValue);
    }, debounceMs);

    return () => {
      clearTimeout(handler);
    };
  }, [internalValue, onChange, debounceMs, isControlled]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    // Always update internal state for display purposes
    setInternalValue(newValue);

    // If no debounce is needed or component is controlled, call onChange immediately
    if (onChange && (debounceMs === 0 || isControlled)) {
      onChange(newValue);
    }
  };

  const handleClear = () => {
    setInternalValue("");

    if (onChange) {
      onChange("");
    }
  };

  return (
    <div className={cn("relative w-full max-w-md", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={internalValue} // Always use internal value for display
        onChange={handleChange}
        className="pl-10 pr-10 w-full"
        autoFocus={autoFocus}
        onKeyDown={onKeyDown}
      />
      {clearable && internalValue && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
          onClick={handleClear}
          type="button"
        >
          <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          <span className="sr-only">Clear search</span>
        </Button>
      )}
    </div>
  );
}
