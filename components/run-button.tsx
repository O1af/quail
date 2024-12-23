"use client";
import { Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface RunButtonProps {
  onExecute: () => Promise<void>;
}

export function RunButton({ onExecute }: RunButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      await onExecute();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-[1.2rem] w-[1.2rem] animate-spin" />
      ) : (
        <Play className="h-[1.2rem] w-[1.2rem]" />
      )}
      <span className="sr-only">Execute code</span>
    </Button>
  );
}
