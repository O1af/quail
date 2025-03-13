import { create } from "zustand";
import { ChartData } from "@/lib/types/stores/chart";
import { loadChart, saveChart } from "./chart_store";
import { createClient } from "@/utils/supabase/client";
import { tryCatch } from "@/lib/trycatch";

interface ChartEditorState {
  // Core data
  chartId: string | null;
  chartData: ChartData | null;
  currJsx: string; // Current JSX code displayed in editor
  newJsx: string | null; // New JSX code from streaming
  title: string;

  // UI state
  isLoading: boolean;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  error: string | null;

  // Natural language processing state
  isStreaming: boolean;
  showDiffView: boolean; // Controls diff view visibility

  // Actions
  setChartId: (id: string) => void;
  setCurrJsx: (code: string) => void;
  setNewJsx: (code: string | null) => void;
  setTitle: (title: string) => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  setIsStreaming: (streaming: boolean) => void;
  setShowDiffView: (show: boolean) => void;
  clearError: () => void;
  processIncomingMessage: (message: string) => void;
  acceptChanges: () => void;
  rejectChanges: () => void;

  // Operations
  loadChartData: (chartId: string) => Promise<void>;
  saveChanges: () => Promise<void>;
  resetEditor: () => void;
}

const initialState = {
  chartId: null,
  chartData: null,
  currJsx: "",
  newJsx: null,
  title: "Untitled Chart",
  isLoading: true,
  isSaving: false,
  hasUnsavedChanges: false,
  error: null,
  showUnsavedDialog: false,
  isStreaming: false,
  showDiffView: false,
};

const useChartEditorStore = create<ChartEditorState>((set, get) => ({
  // Initial state
  ...initialState,

  // Basic setters
  setChartId: (id) => set({ chartId: id }),

  setCurrJsx: (code) =>
    set((state) => {
      const originalJsx = state.chartData?.chartJsx || "";
      const originalTitle = state.title || "Untitled Chart";

      // Only update if code actually changed to prevent unnecessary renders
      if (code === state.currJsx) return {};

      return {
        currJsx: code,
        hasUnsavedChanges:
          code !== originalJsx || state.title !== originalTitle,
      };
    }),

  setNewJsx: (code) => set({ newJsx: code }),

  setTitle: (title) =>
    set((state) => {
      const originalTitle = state.title || "Untitled Chart";
      const originalJsx = state.chartData?.chartJsx || "";

      // Only update if title actually changed
      if (title === state.title) return {};

      return {
        title,
        hasUnsavedChanges:
          title !== originalTitle || state.currJsx !== originalJsx,
      };
    }),

  setHasUnsavedChanges: (hasChanges) => {
    // Avoid re-render when setting to the same value
    if (hasChanges === get().hasUnsavedChanges) return;
    set({ hasUnsavedChanges: hasChanges });
  },

  setIsStreaming: (streaming) => {
    set((state) => {
      if (streaming) {
        // When starting to stream, don't show diff view yet, just start streaming
        return {
          isStreaming: streaming,
          // Don't change showDiffView here - keep it as is
        };
      }

      // When streaming completes and we have newJsx, show diff view
      if (!streaming && state.isStreaming && state.newJsx !== null) {
        return {
          isStreaming: streaming,
          showDiffView: true, // Enable diff view when streaming completes
        };
      }

      // When stopping streaming but no changes were made
      if (!streaming && state.isStreaming && state.newJsx === null) {
        return {
          isStreaming: streaming,
          showDiffView: false, // Hide diff view if no new content
        };
      }

      return { isStreaming: streaming };
    });
  },

  setShowDiffView: (show) => set({ showDiffView: show }),

  clearError: () => set({ error: null }),

  processIncomingMessage: (message) => {
    set({ newJsx: message });

    // Log to check values
    console.log("Updated newJsx:", {
      currJsx: get().currJsx,
      newJsx: message,
    });
  },

  acceptChanges: () => {
    const { newJsx } = get();
    if (!newJsx) return;

    // Accept changes: update currJsx with newJsx and exit diff view
    set({
      currJsx: newJsx,
      newJsx: null,
      showDiffView: false,
      hasUnsavedChanges: true,
    });
  },

  rejectChanges: () => {
    // Reject changes: discard newJsx and exit diff view
    set({
      newJsx: null,
      showDiffView: false,
    });
  },

  // Complex operations with tryCatch
  loadChartData: async (chartId) => {
    set({ isLoading: true, error: null, chartId });
    const supabase = createClient();

    // Get current user
    const userResult = await tryCatch(supabase.auth.getUser());

    if (userResult.error || !userResult.data?.data?.user) {
      set({
        error: userResult.error?.message || "Not authenticated",
        isLoading: false,
      });
      return;
    }

    // Load chart data
    const userId = userResult.data.data.user.id;
    const chartResult = await tryCatch(loadChart(chartId, userId));

    if (chartResult.error || !chartResult.data) {
      set({
        error: chartResult.error?.message || "Chart not found",
        isLoading: false,
      });
      return;
    }

    // Update state with loaded data
    const chartDoc = chartResult.data;
    set({
      chartData: chartDoc.data,
      currJsx: chartDoc.data.chartJsx,
      title: chartDoc.title || "Untitled Chart",
      isLoading: false,
      hasUnsavedChanges: false,
      newJsx: null,
      showDiffView: false,
    });
  },

  saveChanges: async () => {
    const { chartId, chartData, currJsx, title } = get();

    if (!chartId || !chartData) {
      set({ error: "No chart data to save" });
      return;
    }

    // Only set isSaving true to trigger minimum re-renders
    set({ isSaving: true });
    const supabase = createClient();

    // Get current user
    const userResult = await tryCatch(supabase.auth.getUser());

    if (userResult.error || !userResult.data?.data?.user) {
      set({
        error: userResult.error?.message || "Not authenticated",
        isSaving: false,
      });
      return;
    }

    // Save chart data
    const userId = userResult.data.data.user.id;
    const updatedChartData = { ...chartData, chartJsx: currJsx, title };

    const saveResult = await tryCatch(
      saveChart(updatedChartData, userId, title, chartId)
    );

    if (saveResult.error) {
      set({
        error: saveResult.error.message || "Failed to save changes",
        isSaving: false,
      });
      return;
    }

    // When successful, update only the necessary state
    set({
      isSaving: false,
      hasUnsavedChanges: false,
      chartData: updatedChartData,
    });
  },

  resetEditor: () => {
    // Reset only essential state for cleanup
    set({
      error: null,
      isStreaming: false,
      showDiffView: false,
      newJsx: null,
    });
  },
}));

export default useChartEditorStore;
