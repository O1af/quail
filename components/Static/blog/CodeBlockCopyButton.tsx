"use client";

import { useState, useEffect } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CodeBlockCopyButtonProps {
  code: string;
  className?: string;
}

export function CodeBlockCopyButton({
  code,
  className,
}: CodeBlockCopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    if (isCopied) {
      timeoutId = setTimeout(() => {
        setIsCopied(false);
      }, 2000); // Reset after 2 seconds
    }
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isCopied]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setIsCopied(true);
      // Optional: Add toast notification here using a library like sonner
      // toast.success("Code copied to clipboard!");
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleCopy}
      className={cn(
        "h-6 w-6 p-1 rounded text-muted-foreground hover:bg-gray-200 dark:hover:bg-zinc-700",
        className
      )}
      aria-label="Copy code"
    >
      {isCopied ? (
        <Check size={14} className="text-green-500" />
      ) : (
        <Copy size={14} />
      )}
    </Button>
  );
}
