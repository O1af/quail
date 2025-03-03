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
  pinned?: boolean;
  onPin?: (id: string) => void;
  // No need for explicit onDuplicate
}

export interface ChartCardProps {
  id: string;
  title: string;
  type: string;
  link?: string;
  updatedAt: Date;
  viewMode: ViewMode;
  pinned: boolean;
  onPin: (id: string) => void;
  // No need for explicit onTitleChange or onDuplicate
}
