// filepath: /Users/olaf/Documents/Quail/quail/components/stores/chartEditor_store.ts
import { create } from "zustand";

// UI state interface - focused on editor state, not server state
interface ChartEditorState {
  // Core editor content
  chartId: string | null;
  currJsx: string; // Current JSX code displayed/edited
  newJsx: string | null; // New JSX code from streaming AI
  title: string; // Current title being edited

  // Original content loaded from server (for comparison)
  originalJsx: string;
  originalTitle: string;

  // UI state flags
  hasUnsavedChanges: boolean; // Derived from comparing current vs original
  error: string | null; // For displaying UI-related errors (e.g., render errors)
  isStreaming: boolean; // AI is generating code
  showDiffView: boolean; // Diff editor is visible

  // Actions
  setChartId: (id: string | null) => void;
  setCurrJsx: (code: string) => void;
  setNewJsx: (code: string | null) => void;
  setTitle: (title: string) => void;
  setIsStreaming: (streaming: boolean) => void;
  setShowDiffView: (show: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  processIncomingMessage: (message: string) => void;
  acceptChanges: () => void;
  rejectChanges: () => void;
  setOriginalContent: (jsx: string, title: string) => void; // Initialize state from fetched data
  resetEditor: () => void; // Reset UI state on unmount or navigation
}

const initialState = {
  chartId: null,
  currJsx: "",
  newJsx: null,
  title: "Untitled Chart",
  originalJsx: "",
  originalTitle: "Untitled Chart",
  hasUnsavedChanges: false,
  error: null,
  isStreaming: false,
  showDiffView: false,
};

const useChartEditorStore = create<ChartEditorState>((set, get) => ({
  ...initialState,

  setChartId: (id: string | null) => set({ chartId: id }),

  setCurrJsx: (code: string) =>
    set((state) => ({
      currJsx: code,
      hasUnsavedChanges:
        code !== state.originalJsx || state.title !== state.originalTitle,
    })),

  setNewJsx: (code: string | null) => set({ newJsx: code }),

  setTitle: (title: string) =>
    set((state) => ({
      title,
      hasUnsavedChanges:
        state.currJsx !== state.originalJsx || title !== state.originalTitle,
    })),

  setIsStreaming: (streaming: boolean) => {
    set((state) => {
      if (streaming) {
        // Starting stream: clear previous diff, keep current view
        return { isStreaming: true, newJsx: null, showDiffView: false };
      } else {
        // Stopping stream: if newJsx exists, show diff view
        return {
          isStreaming: false,
          showDiffView: state.newJsx !== null && state.newJsx !== state.currJsx,
        };
      }
    });
  },

  setShowDiffView: (show: boolean) => set({ showDiffView: show }),

  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),

  processIncomingMessage: (message: string) => {
    // Update newJsx as messages stream in
    set({ newJsx: message });
  },

  setOriginalContent: (jsx: string, title: string) => {
    set({
      originalJsx: jsx,
      originalTitle: title,
      currJsx: jsx, // Initialize current state with fetched data
      title: title,
      hasUnsavedChanges: false, // Start with no unsaved changes
      newJsx: null,
      showDiffView: false,
      isStreaming: false,
      error: null,
    });
  },

  acceptChanges: () => {
    set((state) => {
      if (!state.newJsx) return {}; // No changes to accept
      const changesMade =
        state.newJsx !== state.originalJsx ||
        state.title !== state.originalTitle;
      return {
        currJsx: state.newJsx, // Apply the new JSX
        newJsx: null, // Clear the pending change
        showDiffView: false, // Hide diff view
        hasUnsavedChanges: changesMade, // Mark unsaved if different from original
      };
    });
  },

  rejectChanges: () => {
    // Discard newJsx, hide diff view, keep currJsx as is
    set({
      newJsx: null,
      showDiffView: false,
    });
  },

  resetEditor: () => {
    // Reset UI state, keep chartId if needed for context
    set((state) => ({
      ...initialState,
      chartId: state.chartId, // Preserve chartId if needed
    }));
  },
}));

export default useChartEditorStore;
