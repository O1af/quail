import { useEffect, useState, useRef } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip as ChartJsTooltip,
  Legend,
  Filler,
} from "chart.js";
import type { ChartProps } from "react-chartjs-2";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  ChartJsTooltip,
  Legend,
  Filler
);

// Sample data with revenue metrics
const revenueData = [
  { name: "Jan", total: 1200, growth: 100, target: 1100 }, // 100 above target
  { name: "Feb", total: 2100, growth: 300, target: 1800 }, // 300 above target
  { name: "Mar", total: 1800, growth: -200, target: 2000 }, // 200 below target
  { name: "Apr", total: 2400, growth: 200, target: 2200 }, // 200 above target
  { name: "May", total: 1700, growth: -700, target: 2400 }, // 700 below target
  { name: "Jun", total: 3100, growth: 500, target: 2600 }, // 500 above target
];

// Animation duration constant
const ANIMATION_DURATION = 1200;

export function ChartCard() {
  const chartRef = useRef<ChartJS<"line">>(null);
  const [data, setData] = useState<typeof revenueData>([]);
  const [isTypingDone, setIsTypingDone] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    // Show typing completion immediately
    setIsTypingDone(true);

    // Animated data loading effect
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < revenueData.length) {
        setData(revenueData.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 150);

    return () => clearInterval(interval);
  }, []);

  // Create gradients for chart fills
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    const ctx = chart.ctx;

    // Main line gradient
    const mainGradient = ctx.createLinearGradient(0, 0, 0, 220);
    if (isDark) {
      mainGradient.addColorStop(0, "rgba(16, 185, 129, 0.6)");
      mainGradient.addColorStop(0.6, "rgba(16, 185, 129, 0.15)");
      mainGradient.addColorStop(1, "rgba(16, 185, 129, 0.02)");
    } else {
      mainGradient.addColorStop(0, "rgba(16, 185, 129, 0.5)");
      mainGradient.addColorStop(0.6, "rgba(16, 185, 129, 0.1)");
      mainGradient.addColorStop(1, "rgba(16, 185, 129, 0.01)");
    }

    // Target line gradient
    const targetGradient = ctx.createLinearGradient(0, 0, 0, 220);
    if (isDark) {
      targetGradient.addColorStop(0, "rgba(99, 102, 241, 0.4)");
      targetGradient.addColorStop(0.8, "rgba(99, 102, 241, 0.05)");
      targetGradient.addColorStop(1, "rgba(99, 102, 241, 0.0)");
    } else {
      targetGradient.addColorStop(0, "rgba(99, 102, 241, 0.3)");
      targetGradient.addColorStop(0.7, "rgba(99, 102, 241, 0.05)");
      targetGradient.addColorStop(1, "rgba(99, 102, 241, 0.01)");
    }

    // Update chart datasets with new gradients
    if (chart.data.datasets?.[0]) {
      chart.data.datasets[0].backgroundColor = mainGradient;
    }
    if (chart.data.datasets?.[1]) {
      chart.data.datasets[1].backgroundColor = targetGradient;
    }
    chart.update();
  }, [resolvedTheme, data]);

  // Custom tooltip highlighting
  useEffect(() => {
    const customTooltipPlugin = {
      id: "customTooltip",
      afterDraw: (chart: any) => {
        const activeElements = chart.getActiveElements();
        if (activeElements.length === 0) return;

        const { ctx } = chart;
        const model = activeElements[0];
        const dataIndex = model.index;
        const dataPoint = revenueData[dataIndex];

        if (!dataPoint) return;

        const x = model.element.x;
        const radius = 4;

        // Draw highlight circle
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, model.element.y, radius * 3, 0, 2 * Math.PI);
        ctx.fillStyle = isDark
          ? "rgba(16, 185, 129, 0.15)"
          : "rgba(16, 185, 129, 0.1)";
        ctx.fill();
        ctx.closePath();
        ctx.restore();
      },
    };

    // Register the plugin
    ChartJS.register(customTooltipPlugin);

    return () => {
      // Clean up by unregistering the plugin when component unmounts
      ChartJS.unregister(customTooltipPlugin);
    };
  }, [isDark]);

  const chartJsData = {
    labels: data.map((item) => item.name),
    datasets: [
      {
        label: "Revenue",
        data: data.map((item) => item.total),
        borderColor: isDark
          ? "rgba(16, 185, 129, 0.9)"
          : "rgba(16, 185, 129, 1)",
        borderWidth: 2.5,
        tension: 0.4,
        pointBackgroundColor: "white",
        pointBorderColor: isDark
          ? "rgba(16, 185, 129, 0.9)"
          : "rgba(16, 185, 129, 1)",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6.5,
        pointHoverBorderWidth: 3,
        pointHoverBackgroundColor: "white",
        pointHoverBorderColor: "rgba(16, 185, 129, 1)",
        fill: true,
        order: 1,
      },
      {
        label: "Target",
        data: data.map((item) => item.target),
        borderColor: isDark
          ? "rgba(99, 102, 241, 0.7)"
          : "rgba(99, 102, 241, 0.8)",
        borderWidth: 2,
        borderDash: [5, 5],
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: isDark ? "#1f2937" : "white",
        pointBorderColor: isDark
          ? "rgba(99, 102, 241, 0.8)"
          : "rgba(99, 102, 241, 1)",
        pointBorderWidth: 1.5,
        pointHoverRadius: 5,
        fill: true,
        order: 2,
      },
    ],
  };

  const options: ChartProps<"line">["options"] = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: ANIMATION_DURATION,
      easing: "easeOutQuart",
      delay: (context) => context.dataIndex * 100,
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: "top",
        align: "end",
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          padding: 15,
          boxWidth: 8,
          boxHeight: 8,
          color: isDark ? "#d1d5db" : "#4b5563",
          font: {
            size: 11,
            family: "'Inter', sans-serif",
          },
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: isDark
          ? "rgba(17, 24, 39, 0.95)"
          : "rgba(255, 255, 255, 0.98)",
        titleColor: isDark ? "#f3f4f6" : "#1f2937",
        bodyColor: isDark ? "#9ca3af" : "#6b7280",
        padding: 12,
        cornerRadius: 8,
        boxPadding: 6,
        titleFont: {
          size: 13,
          weight: "bold",
          family: "'Inter', sans-serif",
        },
        bodyFont: {
          size: 12,
          family: "'Inter', sans-serif",
        },
        usePointStyle: true,
        callbacks: {
          title: (tooltipItems) => tooltipItems[0].label,
          label: (context) => {
            const datasetLabel = context.dataset.label || "";
            const value = context.parsed.y;
            return `${datasetLabel}: $${value.toLocaleString()}`;
          },
          afterLabel: (context) => {
            // Only show for "Revenue" and clarify above/below target
            if (context.dataset.label === "Revenue") {
              const dataIndex = context.dataIndex;
              const growth = revenueData[dataIndex]?.growth ?? 0;
              if (growth === 0) return "Met Target";
              if (growth > 0) return `Above Target by $${growth}`;
              return `Below Target by $${Math.abs(growth)}`;
            }
            return "";
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: isDark ? "#9ca3af" : "#6b7280",
          font: {
            size: 10,
            weight: "normal",
            family: "'Inter', sans-serif",
          },
          padding: 5,
        },
      },
      y: {
        grid: {
          display: true,
          color: isDark ? "rgba(75, 85, 99, 0.12)" : "rgba(229, 231, 235, 0.7)",
          lineWidth: 1,
        },
        border: {
          display: false,
        },
        ticks: {
          color: isDark ? "#9ca3af" : "#6b7280",
          font: {
            size: 10,
            weight: "normal",
            family: "'Inter', sans-serif",
          },
          padding: 8,
          callback: (value) =>
            typeof value === "number" ? `$${value / 1000}k` : value,
          maxTicksLimit: 5,
        },
        beginAtZero: true,
      },
    },
    elements: {
      line: {
        capBezierPoints: true,
      },
      point: {
        hitRadius: 8,
        hoverBorderWidth: 4,
      },
    },
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="bg-primary/10 text-[10px]">
              U
            </AvatarFallback>
          </Avatar>
          <div className="rounded-lg bg-muted/60 px-2 py-1.5 text-xs font-medium">
            Analyze revenue trends YTD📈
          </div>
        </div>
      </div>

      {isTypingDone && (
        <div className="flex items-start gap-2 flex-1">
          <Avatar className="h-6 w-6 mt-1">
            <AvatarImage
              src="/quail_logo.svg"
              alt="QuailAI"
              className={isDark ? "brightness-0 invert" : ""}
            />
            <AvatarFallback className="bg-primary/10 text-[10px]">
              Q
            </AvatarFallback>
          </Avatar>

          <motion.div
            className="flex-1 h-full"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="h-full rounded-lg bg-primary/5 backdrop-blur-sm p-3 pb-4 border border-primary/10 relative overflow-hidden">
              {/* Title and summary stats */}
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-medium text-foreground/90">
                  Revenue Dashboard
                </h3>
                {data.length > 0 && (
                  <motion.div
                    className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs bg-green-500/10 text-green-600 dark:text-green-400"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8, duration: 0.4 }}
                  >
                    <TrendingUp className="h-3 w-3" />
                    <span>+158.3% YTD </span>
                  </motion.div>
                )}
              </div>

              {/* Decorative elements */}
              <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-primary/5 rounded-full blur-xl" />
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/3 rounded-full blur-3xl" />
              <div className="absolute -left-12 top-12 w-24 h-24 bg-indigo-500/3 rounded-full blur-2xl" />

              <div className="relative z-10 h-48">
                {" "}
                {/* Set fixed height here */}
                {data.length > 0 ? (
                  <Line ref={chartRef} options={options} data={chartJsData} />
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                    Loading data...
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
