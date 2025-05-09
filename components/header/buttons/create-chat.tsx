"use client";

import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";

export function CreateChat() {
  const router = useRouter();

  const handleCreateNewChat = () => {
    router.push("/chat");
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={handleCreateNewChat}
            aria-label="Create new chat"
          >
            <PlusCircle className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Create new chat</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
