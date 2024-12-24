"use client";

import Editor, { OnMount } from "@monaco-editor/react";
import { useTheme } from "next-themes";
import React, { useEffect } from "react";
import { setupSQLAutocomplete } from "./utils/autocomplete";
import { useEditorStore } from "../stores/editor_store";

export default function SQLEditor() {
  const { theme } = useTheme();
  const { value, setValue, setEditorRef, tables, setQueryHandler } =
    useEditorStore();

  // Setup mock query handler
  useEffect(() => {
    setQueryHandler(async (query: string) => {
      console.log("Handling query:", query);
      // Simulate network delay and random error
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (Math.random() > 0.7) {
        // 30% chance of error for testing
        throw new Error("Mock query execution failed");
      }
    });
  }, [setQueryHandler]);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    setEditorRef(editor);
    setupSQLAutocomplete(monaco, tables);

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      useEditorStore.getState().executeQuery();
    });
  };

  // Update autocomplete when tables change
  useEffect(() => {
    const { editorRef } = useEditorStore.getState();
    if (!editorRef) return;
    const monaco = (window as any).monaco;
    if (monaco) {
      setupSQLAutocomplete(monaco, tables);
    }
  }, [tables]);

  return (
    <Editor
      defaultLanguage="sql"
      value={value}
      onChange={(value) => setValue(value || "")}
      theme={theme === "dark" ? "vs-dark" : "vs-light"}
      onMount={handleEditorDidMount}
      options={{
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        fontSize: 12,
        wordWrap: "on",
        automaticLayout: true,
        tabSize: 2,
        insertSpaces: true,
        lineNumbers: "on",
        formatOnType: true,
        formatOnPaste: true,
        lineNumbersMinChars: 3,
        lineDecorationsWidth: 0,
      }}
    />
  );
}
