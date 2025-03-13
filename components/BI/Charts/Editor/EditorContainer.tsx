"use client";

import { useEffect } from "react";
import useChartEditorStore from "@/components/stores/chartEditor_store";
import { cn } from "@/lib/utils";

interface EditorContainerProps {
  codeEditor: React.ReactNode;
  diffEditor: React.ReactNode;
}

export default function EditorContainer({
  codeEditor,
  diffEditor,
}: EditorContainerProps) {
  const { isStreaming, showDiffView } = useChartEditorStore();

  // Show diff editor only when streaming is complete and in diff view mode
  const shouldShowDiffEditor = !isStreaming && showDiffView;

  // Force resize event when switching editors
  useEffect(() => {
    // Small delay to ensure the DOM has updated
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 50);
    return () => clearTimeout(timer);
  }, [shouldShowDiffEditor]);

  return (
    <div className="relative w-full h-full">
      {/* Show either the code editor or diff editor based on state */}
      <div className={cn(shouldShowDiffEditor ? "hidden" : "block", "h-full")}>
        {codeEditor}
      </div>

      <div className={cn(!shouldShowDiffEditor ? "hidden" : "block", "h-full")}>
        {diffEditor}
      </div>
    </div>
  );
}
