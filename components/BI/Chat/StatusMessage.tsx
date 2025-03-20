"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Avatar } from "@/components/ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Loader2, Database, LineChart } from "lucide-react";

interface StatusMessageProps {
  step: number;
}

// Get step-specific details
function getStepDetails(step: number) {
  switch (step) {
    case 0:
      return {
        message: "Thinking about your request...",
        icon: <Loader2 className="animate-spin" />,
        color: "text-blue-500",
      };
    case 1:
      return {
        message: "Executing SQL query...",
        icon: <Database className="animate-pulse" />,
        color: "text-violet-500",
      };
    case 2:
      return {
        message: "Analyzing query results...",
        icon: <Database className="animate-pulse" />,
        color: "text-violet-500",
      };
    case 3:
      return {
        message: "Creating visualization...",
        icon: <LineChart className="animate-bounce" />,
        color: "text-green-500",
      };
    default:
      return {
        message: "Processing...",
        icon: <Loader2 className="animate-spin" />,
        color: "text-primary",
      };
  }
}

const StatusMessageUI = ({ step }: StatusMessageProps) => {
  const { theme } = useTheme();
  const avatarSrc = theme === "dark" ? "/boticondark.png" : "/boticonlight.png";
  const { message, icon, color } = getStepDetails(step);

  return (
    <motion.div
      className="w-full max-w-3xl mx-auto"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex gap-4 items-start">
        <Avatar className="w-8 h-8 mt-1">
          <AvatarImage src={avatarSrc} alt="AI" />
        </Avatar>

        <div
          className={cn(
            "p-3 rounded-lg bg-muted/50 flex flex-col gap-2",
            color
          )}
        >
          <div className="flex items-center gap-3">
            <div className="shrink-0">{icon}</div>
            <span className="font-medium">{message}</span>
          </div>

          <div className="flex gap-2 mt-1">
            <div className="flex space-x-1">
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: i === step ? [0.8, 1.2, 0.8] : 1,
                    opacity: i === step ? [0.6, 1, 0.6] : i < step ? 1 : 0.4,
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: i === step ? Infinity : 0,
                    ease: "easeInOut",
                  }}
                  className={cn(
                    "size-1.5 rounded-full",
                    i <= step ? color : "bg-muted"
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              Step {step + 1}/4
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Memoize to prevent unnecessary re-renders
export const StatusMessage = memo(
  StatusMessageUI,
  (prevProps, nextProps) => prevProps.step === nextProps.step
);
