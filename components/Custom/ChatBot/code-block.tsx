"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useCopyToClipboard } from "usehooks-ts";
import { useToast } from "@/hooks/use-toast";

interface CodeBlockProps {
  node: any;
  inline: boolean;
  className: string;
  children: any;
}

export function CodeBlock({
  node,
  inline,
  className,
  children,
  ...props
}: CodeBlockProps) {
  const [output, setOutput] = useState<string | null>(null);
  const [tab, setTab] = useState<"code" | "run">("code");
  const [_, copyToClipboard] = useCopyToClipboard();
  const { toast } = useToast(); // Initialize the toast hook

  const handleCopy = async () => {
    await copyToClipboard(children);
    toast({
      description: "Copied to clipboard!",
      duration: 2000, // Adjust duration as needed
    });
  };

  if (!inline) {
    return (
      <div className="not-prose flex flex-col relative">
        {tab === "code" && (
          <>
            <pre
              {...props}
              className={`text-sm w-full overflow-x-auto dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-700 rounded-xl dark:text-zinc-50 text-zinc-900`}
            >
              <code className="whitespace-pre-wrap break-words">
                {children}
              </code>
            </pre>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={handleCopy}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </>
        )}

        {tab === "run" && output && (
          <div className="text-sm w-full overflow-x-auto bg-zinc-800 dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-700 border-t-0 rounded-b-xl text-zinc-50">
            <code>{output}</code>
          </div>
        )}
      </div>
    );
  } else {
    return (
      <code
        className={`${className} text-sm bg-zinc-100 dark:bg-zinc-800 py-0.5 px-1 rounded-md`}
        {...props}
      >
        {children}
      </code>
    );
  }
}
