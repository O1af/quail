import { Database, Lock, CheckCircle2, FileCode2 } from "lucide-react";
import { useEffect, useState } from "react";

type ConnectionStatus = "connecting" | "connected" | "fetching" | "ready";

const steps = [
  {
    status: "connecting",
    message: "Connecting to PostgreSQL Database...",
    icon: Database,
    indicatorColor: "bg-yellow-500",
  },
  {
    status: "connected",
    message: "Secure Connection Established",
    icon: Lock,
    indicatorColor: "bg-green-500",
  },
  {
    status: "fetching",
    message: "Fetching Database Schema...",
    icon: FileCode2,
    indicatorColor: "bg-blue-500",
  },
  {
    status: "ready",
    message: "Context-Aware AI Assistant Ready",
    icon: CheckCircle2,
    indicatorColor: "bg-green-500",
  },
];

export function DBCard() {
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [showLock, setShowLock] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([
    "connecting",
  ]);

  useEffect(() => {
    const timers = [
      { status: "connected", delay: 2000 },
      { status: "fetching", delay: 3500 },
      { status: "ready", delay: 5000 },
    ];

    timers.forEach(({ status, delay }) => {
      setTimeout(() => {
        setStatus(status as ConnectionStatus);
        setCompletedSteps((prev) => [
          ...prev.filter((s) => s !== status),
          status,
        ]);
        if (status === "connected") setShowLock(true);
      }, delay);
    });

    return () => {};
  }, []);

  return (
    <div className="h-[220px] rounded-lg border bg-card p-4 text-card-foreground">
      <div className="flex items-center space-x-2 mb-4">
        <Database className="h-5 w-5 text-primary" />
        <span className="font-medium">localhost:1234/mydb</span>
      </div>
      <div className="space-y-2">
        {steps.map((step) => {
          const isActive = status === step.status;
          const isCompleted = completedSteps.includes(step.status);
          const Icon = step.icon;

          return (
            <div key={step.status} className="flex items-center space-x-2">
              <div
                className={`h-2 w-2 rounded-full ${step.indicatorColor} ${
                  isActive ? "animate-pulse" : isCompleted ? "" : "opacity-30"
                }`}
              />
              <span
                className={`text-sm ${
                  isActive || isCompleted
                    ? "text-muted-foreground"
                    : "text-muted-foreground/50"
                }`}
              >
                {step.message}
              </span>
              {(isActive || isCompleted) && (
                <Icon
                  className={`h-4 w-4 ${
                    isCompleted
                      ? "text-green-500"
                      : "text-primary animate-pulse"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
