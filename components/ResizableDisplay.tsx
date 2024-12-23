"use client";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import SQLEditor, { SQLEditorProps } from "./editor/Editor";

interface ResizableDisplayOwnProps {
  // Add any ResizableDisplay-specific props here
}

interface ResizableDisplayProps extends ResizableDisplayOwnProps {
  editorProps?: SQLEditorProps;
  // Add future component props interfaces here like:
  // resultProps?: ResultComponentProps;
  // visualizationProps?: VisualizationProps;
}

export function ResizableDisplay({ editorProps = {} }: ResizableDisplayProps) {
  return (
    <ResizablePanelGroup direction="horizontal" className="flex-1">
      <ResizablePanel defaultSize={50}>
        <div className="flex h-[200px] items-center justify-center p-6">
          <span className="font-semibold">One</span>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={50}>
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel defaultSize={50}>
            <SQLEditor {...editorProps} />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={50}>
            <div className="flex h-full items-center justify-center p-6">
              <span className="font-semibold">Three</span>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
