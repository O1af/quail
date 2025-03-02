import { LucideIcon } from "lucide-react";

export type ViewMode = "grid" | "list";
export type TabValue = "dashboards" | "charts" | "pinned";

export interface ChartData {
  title: string;
  type: string;
  icon: LucideIcon;
  link: string;
  pinned: boolean;
}

export interface EmptyStateProps {
  title: string;
  description: string;
  actionText: string;
  icon: React.ReactNode;
  onAction?: () => void;
}

export interface DashboardCardProps {
  dashboard: any;
  viewMode: ViewMode;
}

export interface ChartCardProps {
  title: string;
  type: string;
  icon: LucideIcon;
  link: string;
  viewMode: ViewMode;
  pinned: boolean;
  onPin: (title: string) => void;
}
