import {
  BarChart,
  ChartArea,
  ChartScatter,
  FileSpreadsheet,
  Gauge,
  LineChart,
  PieChart,
} from "lucide-react";
import { ChartData } from "./types";

// Sample chart data for demo purposes
export const initialChartsData: ChartData[] = [
  {
    title: "Total Number of Users",
    type: "Bar",
    icon: BarChart,
    link: "/mychart",
    pinned: false,
  },
  {
    title: "Subscription Plans",
    type: "Pie",
    icon: PieChart,
    link: "/mychart",
    pinned: false,
  },
  {
    title: "Monthly Recurring Revenue",
    type: "Area",
    icon: ChartArea,
    link: "/mychart",
    pinned: false,
  },
  {
    title: "Total Revenue Calculation",
    type: "Scatter",
    icon: ChartScatter,
    link: "/mychart",
    pinned: false,
  },
  {
    title: "Retention Rate by User Signup",
    type: "Line",
    icon: LineChart,
    link: "/mychart",
    pinned: false,
  },
  {
    title: "Percentage of Cancelled",
    type: "Single Value",
    icon: Gauge,
    link: "/mychart",
    pinned: false,
  },
  {
    title: "User Data",
    type: "Table",
    icon: FileSpreadsheet,
    link: "/mychart",
    pinned: false,
  },
];

// Format date to relative time (e.g., "2 days ago")
export const formatDate = (dateValue: string | Date) => {
  const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Calculate hours and minutes for same-day updates
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffMinutes < 1) {
      return "just now";
    } else if (diffMinutes < 60) {
      return `${diffMinutes} ${diffMinutes === 1 ? "minute" : "minutes"} ago`;
    } else {
      return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
    }
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 30) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
};
