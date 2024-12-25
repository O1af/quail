import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TableDefinition } from "../editor/utils/autocomplete";
import { editor } from "monaco-editor";

interface EditorStore {
  value: string;
  tables: TableDefinition[];
  editorRef: editor.IStandaloneCodeEditor | null;
  queryHandler: ((query: string) => Promise<void>) | null;
  isExecuting: boolean;
  error: string | null;

  setValue: (value: string) => void;
  setTables: (tables: TableDefinition[]) => void;
  setEditorRef: (editor: editor.IStandaloneCodeEditor | null) => void;
  setQueryHandler: (handler: (query: string) => Promise<void>) => void;
  executeQuery: () => Promise<void>;
  clearError: () => void;
}

export const useEditorStore = create<EditorStore>()(
  persist(
    (set, get) => ({
      value: "",
      tables: [],
      editorRef: null,
      queryHandler: null,
      isExecuting: false,
      error: null,

      setValue: (value) => set({ value }),
      setTables: (tables) => set({ tables }),
      setEditorRef: (editor) => set({ editorRef: editor }),
      setQueryHandler: (handler) => set({ queryHandler: handler }),
      executeQuery: async () => {
        const { editorRef, queryHandler } = get();
        if (editorRef && queryHandler) {
          set({ isExecuting: true, error: null });
          try {
            await queryHandler(editorRef.getValue());
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
