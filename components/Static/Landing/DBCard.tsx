import {
  Database,
  Lock,
  CheckCircle2,
  FileCode2,
  Server,
  Table,
} from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

type ConnectionStatus = "connecting" | "connected" | "fetching" | "ready";

const steps = [
  {
    status: "connecting",
    message: "Connecting to database...",
    icon: Database,
    indicatorColor: "bg-amber-500",
  },
  {
    status: "connected",
    message: "Secure connection established",
    icon: Lock,
    indicatorColor: "bg-green-500",
  },
  {
    status: "fetching",
    message: "Loading schema...",
    icon: FileCode2,
    indicatorColor: "bg-blue-500",
  },
  {
    status: "ready",
    message: "AI Assistant ready",
    icon: CheckCircle2,
    indicatorColor: "bg-green-500",
  },
];

const dbStats = [
  { label: "Tables", value: "24", icon: Table },
  { label: "Size", value: "1.2 GB", icon: Database },
  { label: "Server", value: "AWS RDS", icon: Server },
];

export function DBCard() {
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [completedSteps, setCompletedSteps] = useState<string[]>([
    "connecting",
  ]);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // Speed up the animation
    const timeouts = [
      { status: "connected", delay: 800 },
      { status: "fetching", delay: 1600 },
      { status: "ready", delay: 2400 },
    ];

    timeouts.forEach(({ status, delay }) => {
      const timer = setTimeout(() => {
        setStatus(status as ConnectionStatus);
        setCompletedSteps((prev) => [
          ...prev.filter((s) => s !== status),
          status,
        ]);
      }, delay);
      timers.push(timer);
    });

    return () => {
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="flex flex-col h-full">
      <motion.div
        className={cn(
          "flex items-center justify-between p-2 mb-2 rounded-lg",
          "bg-gradient-to-r from-muted/80 to-muted/30 backdrop-blur-sm",
          "border border-muted/80"
        )}
        initial={{ opacity: 0.6 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center space-x-2">
          <Database className="h-3.5 w-3.5 text-primary" />
          <span className="font-mono text-xs font-medium">
            postgres:5432/mydb
          </span>
        </div>
        <span className="text-xs text-muted-foreground font-medium px-1.5 py-0.5 rounded-md bg-background/50">
          {status === "ready" ? "Connected" : "Connecting..."}
        </span>
      </motion.div>

      <motion.div
        className={cn(
          "flex-1 flex flex-col justify-between p-4 rounded-lg",
          "bg-gradient-to-br from-primary/5 to-primary/10 backdrop-blur-sm",
          "border border-primary/10"
        )}
        initial={{ opacity: 0.8 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground/90">
            Connection Status
          </h3>
          <div className="space-y-3">
            {steps.map((step) => {
              const isActive = status === step.status;
              const isCompleted = completedSteps.includes(step.status);
              const Icon = step.icon;

              return (
                <motion.div
                  key={step.status}
                  className="flex items-center space-x-3"
                  initial={{ x: -5, opacity: 0.5 }}
                  animate={{
                    x: 0,
                    opacity: isActive || isCompleted ? 1 : 0.6,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className={cn(
                      "h-2 w-2 rounded-full",
                      step.indicatorColor,
                      isActive ? "ring-2 ring-offset-1" : "",
                      isActive ? "ring-offset-background" : "",
                      isActive
                        ? `ring-${step.indicatorColor.replace("bg-", "")}/50`
                        : "",
                      !isActive && !isCompleted ? "opacity-30" : ""
                    )}
                    animate={{
                      scale: isActive ? [1, 1.2, 1] : 1,
                      opacity: isActive ? [0.7, 1, 0.7] : isCompleted ? 1 : 0.3,
                    }}
                    transition={{
                      repeat: isActive ? Infinity : 0,
                      duration: 1.5,
                    }}
                  />
                  <span
                    className={`text-xs font-medium ${
                      isActive || isCompleted
                        ? "text-foreground"
                        : "text-muted-foreground/70"
                    }`}
                  >
                    {step.message}
                  </span>
                  {(isActive || isCompleted) && (
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Icon
                        className={`h-3.5 w-3.5 ml-auto ${
                          isCompleted ? "text-green-500" : "text-primary"
                        }`}
                      />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {status === "ready" && (
          <motion.div
            className="mt-5 pt-3 border-t border-primary/10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <h3 className="text-sm font-medium text-foreground/90 mb-3">
              Database Information
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {dbStats.map((stat, idx) => {
                const StatIcon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    className="flex flex-col items-center justify-center p-2 rounded-lg bg-background/50 border border-border/40"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.3 + idx * 0.1 }}
                  >
                    <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 mb-1">
                      <StatIcon className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="text-xs font-semibold">{stat.value}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {stat.label}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Decorative elements */}
        <div className="absolute -bottom-8 -right-8 w-16 h-16 bg-primary/10 rounded-full blur-xl" />
        <div
          className={`absolute top-1 left-1 w-24 h-24 ${
            resolvedTheme === "dark" ? "bg-blue-500/5" : "bg-blue-500/10"
          } rounded-full blur-3xl`}
        />
      </motion.div>
    </div>
  );
}
