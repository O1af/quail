"use client";

import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { memo, useCallback } from "react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchBar = memo(function SearchBar({
  value,
  onChange,
}: SearchBarProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  const handleClear = useCallback(() => {
    onChange("");
  }, [onChange]);

  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search schemas, tables, or columns..."
        value={value}
        onChange={handleChange}
        className="pl-9 pr-9"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
});
