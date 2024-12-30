"use client";

import Editor, { OnMount } from "@monaco-editor/react";
import { useTheme } from "next-themes";
import React, { useEffect } from "react";
import { setupSQLAutocomplete } from "./utils/autocomplete";
import { useEditorStore } from "../stores/editor_store";
import { useTableStore } from "../stores/table_store";

export default function SQLEditor() {
  const { theme } = useTheme();
  const { value, setValue, setEditorRef } = useEditorStore();
  const databaseStructure = useTableStore((state) => state.databaseStructure);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    setEditorRef(editor);
    setupSQLAutocomplete(monaco, databaseStructure);

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      useEditorStore.getState().executeQuery();
    });

    editor.updateOptions({
      suggestOnTriggerCharacters: true,
      quickSuggestions: { other: true, comments: true, strings: true },
    });
  };

  // Update autocomplete when database structure changes
  useEffect(() => {
    try {
      const { editorRef } = useEditorStore.getState();
      console.log("databaseStructure", databaseStructure);
      if (!editorRef) return;

      // Ensure Monaco is available and initialized
      if (typeof window !== "undefined" && (window as any).monaco) {
        const monaco = (window as any).monaco;
        console.log("setting up autocomplete");
        setupSQLAutocomplete(monaco, databaseStructure);
      }
    } catch (error) {
      console.error("Error setting up SQL autocomplete:", error);
    }
  }, [databaseStructure]);

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
