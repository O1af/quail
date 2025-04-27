import { useTheme } from "next-themes";
import Editor, { OnMount } from "@monaco-editor/react";
import { useEffect, useState, useRef, useCallback } from "react";
import type * as Monaco from "monaco-editor";
import { Keyboard, Save } from "lucide-react";
import useChartEditorStore from "@/components/stores/chartEditor_store";

interface ChartCodeEditorProps {
  showStatus?: boolean; // Keep this prop
}

export default function ChartCodeEditor({
  showStatus = true, // Default to true
}: ChartCodeEditorProps) {
  const { resolvedTheme } = useTheme();
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof Monaco | null>(null); // Ref for monaco instance

  // Get state and actions from Zustand store
  const {
    currJsx,
    newJsx,
    isStreaming,
    setCurrJsx,
    originalJsx,
    title,
    originalTitle,
  } = useChartEditorStore();

  // Local state to track if the editor content differs from the store's currJsx
  // This helps manage the "Unsaved changes" status locally within the editor
  const [localCode, setLocalCode] = useState(currJsx);
  const [isLocallySaved, setIsLocallySaved] = useState(true); // Tracks if Ctrl+S was pressed

  const editorTheme = resolvedTheme === "dark" ? "vs-dark" : "light";

  // Determine what code to display in the editor
  // Show newJsx during streaming, otherwise show currJsx
  const displayCode = isStreaming && newJsx !== null ? newJsx : currJsx;

  // Handle local save (Ctrl+S): Update Zustand store's currJsx
  const handleEditorSave = useCallback(() => {
    if (!editorRef.current || isStreaming) return;

    const currentValue = editorRef.current.getValue();
    setCurrJsx(currentValue); // Update the store, which triggers hasUnsavedChanges calculation
    setLocalCode(currentValue); // Sync local state
    setIsLocallySaved(true); // Mark as locally saved
  }, [setCurrJsx, isStreaming]);

  // Handle editor mount - setup editor reference and events
  const handleEditorDidMount: OnMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor;
      monacoRef.current = monaco; // Store monaco instance

      // Track changes locally to update the save status indicator
      editor.onDidChangeModelContent(() => {
        const currentEditorValue = editor.getValue();
        setLocalCode(currentEditorValue);
        // Check if the current editor value matches the store's current JSX
        // If not, it means there are unsaved local edits
        // FIX: Use currJsx from hook, not get()
        setIsLocallySaved(currentEditorValue === currJsx);
      });

      // Add keyboard shortcut for saving (updates Zustand store)
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
    [handleEditorSave, currJsx] // Add currJsx as dependency
  );

  // Update editor content when displayCode changes from the store
  // This happens when currJsx changes (e.g., after accepting changes) or when streaming starts/stops
  useEffect(() => {
    if (editorRef.current && displayCode !== localCode) {
      // Only update editor if the display code is different from local editor state
      // Prevents overwriting user edits unless the underlying store state changes
      editorRef.current.setValue(displayCode);
      setLocalCode(displayCode); // Sync local state
      // Check if the new displayCode matches the store's currJsx after update
      setIsLocallySaved(displayCode === useChartEditorStore.getState().currJsx);
    }
  }, [displayCode]); // Rerun when displayCode changes

  // Update local saved status when currJsx changes in the store
  // (e.g., after accepting changes or saving via header)
  useEffect(() => {
    setIsLocallySaved(localCode === currJsx);
  }, [currJsx, localCode]);

  const isMac =
    typeof navigator !== "undefined"
      ? navigator.userAgent.includes("Mac")
      : false;
  const saveShortcut = isMac ? "⌘+S" : "Ctrl+S";

  // Determine the status message
  const getStatusMessage = () => {
    if (isStreaming) return "Editing disabled during generation";
    // Check if editor content differs from the store's currJsx
    if (localCode !== currJsx)
      return "Unsaved changes (Press " + saveShortcut + ")";
    // Check if store's currJsx or title differs from original (requires server save)
    if (currJsx !== originalJsx || title !== originalTitle)
      return "Changes ready to save (via Header)";
    return "Changes saved locally"; // Implies local state matches store, and store matches original
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-0">
        {" "}
        {/* Added min-h-0 */}
        <Editor
          height="100%"
          language="javascript" // Assuming JSX is treated as JS here
          value={displayCode} // Use displayCode
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
            readOnly: isStreaming, // Editor is read-only during streaming
          }}
        />
      </div>

      {/* Keep the status bar */}
      {showStatus && (
        <div className="py-1 px-3 text-xs flex items-center gap-2 border-t bg-muted/20 justify-between text-muted-foreground h-6 shrink-0">
          <div className="flex items-center gap-1">
            <Keyboard className="h-3 w-3" />
            <span className="font-mono">{saveShortcut}</span>
            <span>to update local state</span>
          </div>
          <div className="flex items-center gap-1">
            {localCode !== currJsx && (
              <Save className="h-3 w-3 text-yellow-500" />
            )}
            <span>{getStatusMessage()}</span>
          </div>
        </div>
      )}
    </div>
  );
}
