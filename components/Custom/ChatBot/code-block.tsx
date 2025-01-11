"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Repeat } from "lucide-react";
import { useCopyToClipboard } from "usehooks-ts";
import { useToast } from "@/hooks/use-toast";
import { useEditorStore } from "@/components/stores/editor_store";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const sqlRegex =
  /^(SELECT|INSERT|UPDATE|DELETE|MERGE|REPLACE|CREATE|DROP|ALTER|TRUNCATE|GRANT|REVOKE|COMMIT|ROLLBACK|SAVEPOINT|SET|SHOW|DESCRIBE|EXPLAIN|USE|LOCK|UNLOCK|TRUNCATE|BEGIN|END|CALL|EXCEPT|INTERSECT|FETCH)\s+/i;

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
  const { setValue } = useEditorStore();

  const isSQL = sqlRegex.test(children);

  const handleCopy = async () => {
    await copyToClipboard(children);
    toast({
      description: "Copied to clipboard!",
      duration: 1750,
    });
  };

  const insertCode = (children: React.ReactNode) => {
    // Set the new value for the editor when the button is clicked
    const newValue = `${children}`; // Example: Dynamically use the children content
    setValue(newValue);
    toast({
      description: "Editor content replaced!",
      duration: 1750,
    });
  };

  if (!inline) {
    return (
      <div>
        {tab === "code" && isSQL ? (
          <div className="not-prose flex flex-col relative">
            <div className="absolute top-0 left-0 right-0 flex justify-end bg-zinc-100 dark:bg-zinc-800 rounded-t-xl border-b border-zinc-200 dark:border-zinc-700">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-md hover:bg-zinc-700 focus:outline-none"
                      onClick={() => insertCode(children)}
                    >
                      <Repeat className="h-4 w-4 text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Insert code into editor</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-md hover:bg-zinc-700 focus:outline-none"
                      onClick={handleCopy}
                    >
                      <Copy className="h-4 w-4 text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <pre
              {...props}
              className={`text-sm w-full overflow-x-auto dark:bg-zinc-900 p-4 pt-12 border border-zinc-200 dark:border-zinc-700 rounded-xl dark:text-zinc-50 text-zinc-900`}
            >
              <code className="whitespace-pre-wrap break-words">
                {children}
              </code>
            </pre>
          </div>
        ) : (
          <p className="font-bold italic"> {children} </p>
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
