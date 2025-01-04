import { create } from "zustand";
import { persist } from "zustand/middleware";
import { editor } from "monaco-editor";
import { handleQuery } from "./utils/query";

interface EditorStore {
  value: string;
  editorRef: editor.IStandaloneCodeEditor | null;
  queryHandler: (() => Promise<void>) | null;
  isExecuting: boolean;
  error: string | null;

  setValue: (value: string) => void;
  setEditorRef: (editor: editor.IStandaloneCodeEditor | null) => void;
  executeQuery: () => Promise<void>;
  clearError: () => void;
}

export const useEditorStore = create<EditorStore>()(
  persist(
    (set, get) => ({
      value: "",
      editorRef: null,
      queryHandler: handleQuery,
      isExecuting: false,
      error: null,

      setValue: (value) => set({ value }),
      setEditorRef: (editor) => set({ editorRef: editor }),
      executeQuery: async () => {
        const { editorRef, queryHandler } = get();
        if (editorRef && queryHandler) {
          set({ isExecuting: true, error: null });
          try {
            await queryHandler();
          } catch (e) {
            const errorMessage =
              e instanceof Error ? e.message : "Query execution failed";
            set({ error: errorMessage });
          } finally {
            set({ isExecuting: false });
          }
        }
      },
      clearError: () => set({ error: null }),
    }),
    {
      name: "editor-storage",
      partialize: (state) => ({ value: state.value }),
    }
  )
);
