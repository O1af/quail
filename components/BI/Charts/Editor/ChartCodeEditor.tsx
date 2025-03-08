import { useTheme } from "next-themes";
import Editor, { OnMount } from "@monaco-editor/react";
import { useEffect, useState, useRef, useCallback } from "react";
import type * as Monaco from "monaco-editor";
import { Keyboard, Save } from "lucide-react";

interface ChartCodeEditorProps {
  jsxCode: string;
  onChange?: (value: string) => void;
  showStatus?: boolean;
}

export default function ChartCodeEditor({
  jsxCode,
  onChange,
  showStatus = true,
}: ChartCodeEditorProps) {
  const { resolvedTheme } = useTheme();
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const [localCode, setLocalCode] = useState(jsxCode);
  const [isSaved, setIsSaved] = useState(true);

  const editorTheme = resolvedTheme === "dark" ? "vs-dark" : "light";

  const handleEditorSave = useCallback(() => {
    if (!editorRef.current || !onChange) return;

    const currentValue = editorRef.current.getValue();
    setLocalCode(currentValue);
    onChange(currentValue);
    setIsSaved(true);
  }, [onChange]);

  // Handle editor mount - setup editor reference and events
  const handleEditorDidMount: OnMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor;

      // Track local changes without saving to parent state
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

  // Update editor content when jsxCode prop changes from outside
  useEffect(() => {
    if (editorRef.current && jsxCode !== localCode && isSaved) {
      editorRef.current.setValue(jsxCode);
      setLocalCode(jsxCode);
    }
  }, [jsxCode, localCode, isSaved]);

  const isMac =
    typeof navigator !== "undefined"
      ? navigator.platform.includes("Mac")
      : false;
  const saveShortcut = isMac ? "⌘+S" : "Ctrl+S";

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1">
        <Editor
          height="100%"
          language="javascript"
          value={jsxCode}
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
          }}
        />
      </div>

      {showStatus && (
        <div className="py-2 px-3 text-xs text-muted-foreground flex items-center gap-2 border-t bg-muted/20">
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
