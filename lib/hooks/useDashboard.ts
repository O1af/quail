import { useState, useEffect } from "react";
import { loadDashboard, Dashboard } from "@/components/stores/dashboard_store";
import { loadChart } from "@/components/stores/chartActions";

export function useDashboard(slug: string, userId: string) {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [chartData, setChartData] = useState<Map<string, any>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const dashboardData = await loadDashboard(slug, userId);
        setDashboard(dashboardData);

        if (!dashboardData) {
          setError("Dashboard not found or you don't have access");
          return;
        }

        // Load all chart data
        const chartDataMap = new Map<string, any>();
        for (const chartId of dashboardData.charts) {
          const chart = await loadChart(userId, chartId);
          chartDataMap.set(chartId, chart);
        }

        setChartData(chartDataMap);
      } catch (err) {
        console.error("Error loading dashboard:", err);
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [slug, userId]);

  return { dashboard, chartData, loading, error };
}
