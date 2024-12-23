"use client";

import Editor, { OnMount } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import { useTheme } from "next-themes";
import React, { useCallback } from "react";
import { setupSQLAutocomplete } from "./utils/autocomplete";
import { TableDefinition } from "./utils/autocomplete";
export interface SQLEditorProps {
  initialValue?: string;
  onExecute?: (query: string) => void;
  tables?: TableDefinition[];
}

export default function SQLEditor({
  initialValue = "",
  onExecute,
  tables = [],
}: SQLEditorProps) {
  const { theme } = useTheme();
  const editorRef = React.useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    setupSQLAutocomplete(monaco, tables);

    // Add keyboard shortcut for query execution
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (onExecute) {
        onExecute(editor.getValue());
      }
    });
  };

  const handleExecuteQuery = useCallback(() => {
    if (onExecute && editorRef.current) {
      onExecute(editorRef.current.getValue());
    }
  }, [onExecute]);

  return (
    <Editor
      defaultLanguage="sql"
      defaultValue={initialValue}
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
