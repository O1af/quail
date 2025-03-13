import { useTheme } from "next-themes";
import { DiffEditor } from "@monaco-editor/react";
import useChartEditorStore from "@/components/stores/chartEditor_store";
import { useEffect, useState, useRef } from "react";
import type * as Monaco from "monaco-editor";

export default function ChartDiffEditor() {
  const { resolvedTheme } = useTheme();
  const { currJsx, newJsx } = useChartEditorStore();
  const [diffValue, setDiffValue] = useState({ original: "", modified: "" });
  const editorRef = useRef<Monaco.editor.IStandaloneDiffEditor | null>(null);
  const editorTheme = resolvedTheme === "dark" ? "vs-dark" : "light";

  // Update the diff values whenever the code changes
  useEffect(() => {
    const original = currJsx || "";
    const modified = newJsx || "";
    console.log("Diff values updated:", { original, modified });

    setDiffValue({ original, modified });

    // Force editor to refresh
    if (editorRef.current) {
      setTimeout(() => {
        editorRef.current?.updateOptions({});
      }, 10);
    }
  }, [currJsx, newJsx]);

  // Handle editor mount to keep a reference
  const handleEditorDidMount = (
    editor: Monaco.editor.IStandaloneDiffEditor
  ) => {
    editorRef.current = editor;

    // Configure the editor's appearance after mount
    if (editor) {
      const originalEditor = editor.getOriginalEditor();
      const modifiedEditor = editor.getModifiedEditor();

      modifiedEditor.updateOptions({
        lineNumbersMinChars: 3,
        folding: true,
      });
    }
  };

  return (
    <div className="h-full w-full">
      <DiffEditor
        height="100%"
        language="javascript"
        original={diffValue.original}
        modified={diffValue.modified}
        theme={editorTheme}
        onMount={handleEditorDidMount}
        options={{
          readOnly: true,
          minimap: { enabled: false },
          wordWrap: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          lineNumbers: "off",
          fontSize: 12,
          renderSideBySide: false,
          diffWordWrap: "on",
          ignoreTrimWhitespace: false,
          renderOverviewRuler: false,
          renderIndicators: true,
          originalEditable: false,
          renderLineHighlight: "all",
          lineNumbersMinChars: 3,
          experimental: {
            useTrueInlineView: true,
          },
        }}
      />
    </div>
  );
}
