"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { editor } from "monaco-editor";
import { executeQueryAndTransform } from "@/lib/hooks/query-helpers";
import { tableQueryKeys } from "@/lib/hooks/use-table-data";
import { queryClient } from "@/lib/providers/react-query-provider";

interface EditorStore {
  value: string;
  executedQuery: string | null; // Track the last executed query separately
  editorRef: editor.IStandaloneCodeEditor | null;
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
      executedQuery: null, // Initially no query has been executed
      editorRef: null,
      isExecuting: false,
      error: null,

      setValue: (value) => set({ value }),
      setEditorRef: (editor) => set({ editorRef: editor }),
      executeQuery: async () => {
        const { value } = get();

        set({ isExecuting: true, error: null });
        try {
          // Execute the query and get the results
          const result = await executeQueryAndTransform(value);

          // Update executedQuery to match the current value
          set({ executedQuery: value });

          // Use the exported queryClient instance to update the cache directly
          if (typeof window !== "undefined" && queryClient) {
            // Set the query data directly in the cache
            queryClient.setQueryData(
              [...tableQueryKeys.tableData(), value],
              result
            );
          }
        } catch (e) {
          const errorMessage =
            e instanceof Error ? e.message : "Query execution failed";
          set({ error: errorMessage });
        } finally {
          set({ isExecuting: false });
        }
      },
      clearError: () => set({ error: null }),
    }),
    {
      name: "editor-storage",
      partialize: (state) => ({
        value: state.value,
        executedQuery: state.executedQuery,
      }),
    }
  )
);
