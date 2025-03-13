import { useTheme } from "next-themes";
import Editor, { OnMount } from "@monaco-editor/react";
import { useEffect, useState, useRef, useCallback } from "react";
import type * as Monaco from "monaco-editor";
import { Keyboard, Save } from "lucide-react";
import useChartEditorStore from "@/components/stores/chartEditor_store";

interface ChartCodeEditorProps {
  showStatus?: boolean;
}

export default function ChartCodeEditor({
  showStatus = true,
}: ChartCodeEditorProps) {
  const { resolvedTheme } = useTheme();
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const [isSaved, setIsSaved] = useState(true);

  // Get everything directly from the store
  const { currJsx, newJsx, isStreaming, setCurrJsx } = useChartEditorStore();

  // Keep a local copy of the code for tracking unsaved changes
  const [localCode, setLocalCode] = useState(currJsx);

  const editorTheme = resolvedTheme === "dark" ? "vs-dark" : "light";

  // Determine what code to display in the editor
  const displayCode = isStreaming && newJsx ? newJsx : currJsx;

  // Handle saving changes to the store
  const handleEditorSave = useCallback(() => {
    if (!editorRef.current) return;

    const currentValue = editorRef.current.getValue();
    setLocalCode(currentValue);
    setCurrJsx(currentValue);
    setIsSaved(true);
  }, [setCurrJsx]);

  // Handle editor mount - setup editor reference and events
  const handleEditorDidMount: OnMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor;

      // Track local changes without saving to store immediately
      editor.onDidChangeModelContent(() => {
        setLocalCode(editor.getValue());
        setIsSaved(false);
      });

      // Add keyboard shortcuts
      editor.addCommand(
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
        handleEditorSave
      );

      // Enable zoom in/out with Ctrl/Cmd+/- keys
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Equal, () => {
        const currentFontSize = editor.getOption(
          monaco.editor.EditorOption.fontSize
        );
        editor.updateOptions({ fontSize: currentFontSize + 1 });
      });

      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Minus, () => {
        const currentFontSize = editor.getOption(
          monaco.editor.EditorOption.fontSize
        );
        if (currentFontSize > 8)
          editor.updateOptions({ fontSize: currentFontSize - 1 });
      });
    },
    [handleEditorSave]
  );

  // Update editor content when store state changes
  useEffect(() => {
    if (editorRef.current) {
      // When streaming, show the newJsx if available
      if (isStreaming && newJsx) {
        editorRef.current.setValue(newJsx);
        setLocalCode(newJsx);
      }
      // When not streaming and displayCode is different from local
      else if (displayCode !== localCode && isSaved) {
        editorRef.current.setValue(displayCode);
        setLocalCode(displayCode);
      }
    }
  }, [currJsx, newJsx, localCode, isSaved, isStreaming, displayCode]);

  const isMac =
    typeof navigator !== "undefined"
      ? navigator.userAgent.includes("Mac")
      : false;
  const saveShortcut = isMac ? "⌘+S" : "Ctrl+S";

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1">
        <Editor
          height="100%"
          language="javascript"
          value={displayCode}
          theme={editorTheme}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            wordWrap: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            fontSize: 12,
            renderLineHighlight: "all",
            renderWhitespace: "selection",
            quickSuggestions: true,
            lineNumbersMinChars: 3,
            lineDecorationsWidth: 0,
            readOnly: isStreaming,
          }}
        />
      </div>

      {showStatus && (
        <div className="py-2 px-3 text-xs flex items-center gap-2 border-t bg-muted/20 justify-between">
          <div className="flex items-center">
            <Keyboard className="h-3 w-3 mr-1" />
            <span className="font-mono">{saveShortcut}</span>
          </div>
          <span>to save changes locally</span>
          <span className="ml-auto flex items-center">
            <Save className="h-3 w-3 mr-1" />
            <span>{isSaved ? "Changes saved locally" : "Unsaved changes"}</span>
          </span>
        </div>
      )}
    </div>
  );
}
