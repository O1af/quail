import { create } from "zustand";
import { ChartData } from "@/lib/types/stores/chart";
import { loadChart, saveChart } from "./chart_store";
import { createClient } from "@/utils/supabase/client";

interface ChartEditorState {
  // State
  chartId: string | null;
  chartData: ChartData | null;
  jsxCode: string;
  naturalLanguagePrompt: string;
  title: string;
  isProcessingPrompt: boolean;
  isSaving: boolean;
  isLoading: boolean;
  hasUnsavedChanges: boolean;
  error: string | null;
  showUnsavedDialog: boolean;

  // Actions
  setChartId: (id: string) => void;
  setJsxCode: (code: string) => void;
  setNaturalLanguagePrompt: (prompt: string) => void;
  setTitle: (title: string) => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  setShowUnsavedDialog: (show: boolean) => void;
  clearError: () => void;

  // Operations
  loadChartData: (chartId: string) => Promise<void>;
  saveChanges: () => Promise<void>;
  processNaturalLanguagePrompt: () => Promise<void>;
  resetEditor: () => void;
}

const initialState = {
  chartId: null,
  chartData: null,
  jsxCode: "",
  naturalLanguagePrompt: "",
  title: "Untitled Chart",
  isProcessingPrompt: false,
  isSaving: false,
  isLoading: true,
  hasUnsavedChanges: false,
  error: null,
  showUnsavedDialog: false,
};

const useChartEditorStore = create<ChartEditorState>((set, get) => ({
  // Initial state
  ...initialState,

  // Basic setters
  setChartId: (id) => set({ chartId: id }),

  setJsxCode: (code) =>
    set((state) => {
      const originalJsx = state.chartData?.chartJsx || "";
      const originalTitle = state.title || "Untitled Chart";

      return {
        jsxCode: code,
        hasUnsavedChanges:
          code !== originalJsx || state.title !== originalTitle,
      };
    }),

  setNaturalLanguagePrompt: (prompt) => set({ naturalLanguagePrompt: prompt }),

  setTitle: (title) =>
    set((state) => {
      const originalTitle = state.title || "Untitled Chart";
      const originalJsx = state.chartData?.chartJsx || "";

      return {
        title,
        hasUnsavedChanges:
          title !== originalTitle || state.jsxCode !== originalJsx,
      };
    }),

  setHasUnsavedChanges: (hasChanges) => set({ hasUnsavedChanges: hasChanges }),

  setShowUnsavedDialog: (show) => set({ showUnsavedDialog: show }),

  clearError: () => set({ error: null }),

  // Complex operations
  loadChartData: async (chartId) => {
    const supabase = createClient();
    set({ isLoading: true, error: null, chartId });

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        set({ error: "Not authenticated", isLoading: false });
        return;
      }

      const chartDoc = await loadChart(chartId, user.id);

      if (chartDoc) {
        set({
          chartData: chartDoc.data,
          jsxCode: chartDoc.data.chartJsx,
          title: chartDoc.title,
          isLoading: false,
          hasUnsavedChanges: false,
        });
      } else {
        set({ error: "Chart not found", isLoading: false });
      }
    } catch (error) {
      console.error("Error loading chart:", error);
      set({
        error: "Failed to load chart data",
        isLoading: false,
      });
    }
  },

  saveChanges: async () => {
    const { chartId, chartData, jsxCode, title } = get();

    if (!chartId || !chartData) return;

    const supabase = createClient();
    set({ isSaving: true, error: null });

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        set({ error: "Not authenticated", isSaving: false });
        return;
      }

      await saveChart(
        { ...chartData, chartJsx: jsxCode },
        user.id,
        title,
        chartId
      );

      set({
        isSaving: false,
        hasUnsavedChanges: false,
        chartData: { ...chartData, chartJsx: jsxCode },
      });
    } catch (error) {
      console.error("Error saving chart:", error);
      set({
        error: "Failed to save changes",
        isSaving: false,
      });
    }
  },

  processNaturalLanguagePrompt: async () => {
    const { naturalLanguagePrompt, jsxCode, chartData } = get();

    if (!naturalLanguagePrompt.trim() || !chartData) return;

    set({ isProcessingPrompt: true, error: null });

    try {
      const response = await fetch("/api/chart/update-with-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: naturalLanguagePrompt,
          currentJsx: jsxCode,
          data: chartData.data,
          query: chartData.query,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to process prompt");
      }

      const result = await response.json();
      set({
        jsxCode: result.updatedJsx,
        isProcessingPrompt: false,
        hasUnsavedChanges: true,
      });
    } catch (error) {
      console.error("Error processing prompt:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to process prompt",
        isProcessingPrompt: false,
      });
    }
  },

  resetEditor: () => {
    // Instead of setting all state at once, just clear the critical parts
    // that won't cause rendering issues during unmounting
    set({
      error: null,
      showUnsavedDialog: false,
    });

    // Skip setting other state values during cleanup to prevent infinite loops
    // Full resets will happen when the component mounts again
  },
}));

export default useChartEditorStore;
