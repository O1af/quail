"use client";

import Editor, { OnMount } from "@monaco-editor/react";
import { useTheme } from "next-themes";
import React, { useEffect, useCallback } from "react";
import { setupSQLAutocomplete } from "./utils/autocomplete";
import { useEditorStore } from "../stores/editor_store";
import { useTableStore } from "../stores/table_store";

export default React.memo(function SQLEditor() {
  const { theme } = useTheme();
  const value = useEditorStore((state) => state.value);
  const setValue = useEditorStore((state) => state.setValue);
  const setEditorRef = useEditorStore((state) => state.setEditorRef);
  const databaseStructure = useTableStore((state) => state.databaseStructure);

  const handleEditorDidMount = useCallback<OnMount>((editor, monaco) => {
    setEditorRef(editor);
    setupSQLAutocomplete(monaco, databaseStructure);

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      useEditorStore.getState().executeQuery();
    });

    editor.updateOptions({
      suggestOnTriggerCharacters: true,
      quickSuggestions: { other: true, comments: true, strings: true },
    });
  }, [databaseStructure, setEditorRef]);

  const handleChange = useCallback((value: string | undefined) => {
    setValue(value || "");
  }, [setValue]);

  // Update autocomplete when database structure changes
  useEffect(() => {
    const { editorRef } = useEditorStore.getState();
    if (!editorRef || typeof window === "undefined") return;

    const monaco = (window as any).monaco;
    if (!monaco) return;

    try {
      setupSQLAutocomplete(monaco, databaseStructure);
    } catch (error) {
      console.error("Error setting up SQL autocomplete:", error);
    }
  }, [databaseStructure]);

  return (
    <Editor
      defaultLanguage="sql"
      value={value}
      onChange={handleChange}
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
});
