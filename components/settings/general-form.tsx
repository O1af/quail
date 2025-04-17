"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { getUserUsageStats } from "@/utils/metrics/usage";
import { Progress } from "@/components/ui/progress";

export function GeneralForm() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [usageStats, setUsageStats] = useState<{
    queries: number;
    limit: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Prevent hydration mismatch by waiting until client-side
  useEffect(() => {
    setMounted(true);
    // Load user preferences from localStorage
    const savedShowCode = localStorage.getItem("settings:showCode");
    const savedShowSuggestions = localStorage.getItem(
      "settings:showSuggestions"
    );

    if (savedShowCode !== null) {
      setShowCode(savedShowCode === "true");
    }
    if (savedShowSuggestions !== null) {
      setShowSuggestions(savedShowSuggestions === "true");
    }

    // Fetch usage stats
    const fetchUsageStats = async () => {
      try {
        const stats = await getUserUsageStats();
        setUsageStats(stats);
      } catch (error) {
        console.error("Error fetching usage stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsageStats();
  }, []);

  // Save preferences to localStorage when they change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("settings:showCode", String(showCode));
      localStorage.setItem("settings:showSuggestions", String(showSuggestions));
    }
  }, [showCode, showSuggestions, mounted]);

  if (!mounted) return null;

  const usagePercentage = usageStats
    ? Math.min(Math.round((usageStats.queries / usageStats.limit) * 100), 100)
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium mb-4">Theme</h3>
        <div className="flex items-center gap-4">
          <Label htmlFor="theme-select" className="min-w-24">
            System
          </Label>
          <Select value={theme} onValueChange={setTheme}>
            <SelectTrigger className="w-[180px]" id="theme-select">
              <SelectValue placeholder="Select theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium mb-2">Preferences</h3>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="show-code" className="font-medium">
              Always show code when using data analyst
            </Label>
          </div>
          <Switch
            id="show-code"
            checked={showCode}
            onCheckedChange={setShowCode}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="show-suggestions" className="font-medium">
              Show follow up suggestions in chats
            </Label>
          </div>
          <Switch
            id="show-suggestions"
            checked={showSuggestions}
            onCheckedChange={setShowSuggestions}
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Usage</h3>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : usageStats ? (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>AI-Assisted queries this month</span>
              <span className="font-medium">
                {usageStats.queries} / {usageStats.limit}
              </span>
            </div>
            <Progress value={usagePercentage} className="h-2" />
          </div>
        ) : (
          <p className="text-muted-foreground">Unable to load usage data.</p>
        )}
      </div>
    </div>
  );
}
