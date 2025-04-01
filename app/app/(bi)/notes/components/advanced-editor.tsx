"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  EditorRoot,
  EditorCommand,
  EditorCommandItem,
  EditorCommandEmpty,
  EditorContent,
  EditorCommandList,
  EditorBubble,
} from "novel";
import { ImageResizer, handleCommandNavigation } from "novel";
import { handleImageDrop, handleImagePaste } from "novel";

import { Separator } from "@/app/app/(bi)/notes/components/separator";
import { defaultExtensions } from "@/app/app/(bi)/notes/components/extensions";
import {
  slashCommand,
  suggestionItems,
} from "@/app/app/(bi)/notes/components/slash-command";
import { uploadFn } from "@/app/app/(bi)/notes/components/image-upload";
import { NodeSelector } from "@/app/app/(bi)/notes/components/node-selector";
import { LinkSelector } from "@/app/app/(bi)/notes/components/link-selector";
import { TextButtons } from "@/app/app/(bi)/notes/components/text-buttons";
import { ColorSelector } from "@/app/app/(bi)/notes/components/color-selector";

const extensions = [...defaultExtensions, slashCommand];

interface EditorProp {
  initialValue?: string;
  onChange: (value: string) => void;
  height?: string;
}

const Editor = ({ initialValue, onChange, height = "500px" }: EditorProp) => {
  const [openNode, setOpenNode] = useState(false);
  const [openColor, setOpenColor] = useState(false);
  const [openLink, setOpenLink] = useState(false);
  const [editorInstance, setEditorInstance] = useState<any>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  // Handle direct clicks on the editor container
  useEffect(() => {
    if (editorInstance && editorContainerRef.current) {
      const container = editorContainerRef.current;

      const handleContainerClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;

        // If clicking the container but not on actual editor content
        if (
          target === container ||
          target.classList.contains("editor-container")
        ) {
          e.preventDefault();
          e.stopPropagation();
          editorInstance.commands.focus("end");
        }
      };

      container.addEventListener("click", handleContainerClick);

      return () => {
        container.removeEventListener("click", handleContainerClick);
      };
    }
  }, [editorInstance]);

  // Insert a paragraph at the end if needed
  useEffect(() => {
    if (editorInstance) {
      // If editor is empty, insert a paragraph so cursor can be placed
      if (editorInstance.isEmpty) {
        editorInstance.commands.focus("start");
      }
    }
  }, [editorInstance]);

  return (
    <EditorRoot>
      <div
        className="editor-container relative h-full w-full cursor-text"
        style={{ height }}
        ref={editorContainerRef}
      >
        <EditorContent
          ref={editorRef}
          className="h-full notion-like-editor"
          {...(initialValue && { initialContent: initialValue })}
          extensions={extensions}
          editorProps={{
            handleDOMEvents: {
              keydown: (_view, event) => handleCommandNavigation(event),
              mousedown: (view, event) => {
                // Check if we're clicking in empty space
                const target = event.target as HTMLElement;
                const editorElement = view.dom as HTMLElement;

                // If clicking empty space in the editor (not on content)
                if (target === editorElement) {
                  // Place cursor at end
                  editorInstance?.commands.focus("end");
                  return true; // Prevent default handling
                }

                return false; // Let other clicks be handled normally
              },
            },
            handlePaste: (view, event) =>
              handleImagePaste(view, event, uploadFn),
            handleDrop: (view, event, _slice, moved) =>
              handleImageDrop(view, event, moved, uploadFn),
            attributes: {
              class: `prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full h-full`,
            },
            autofocus: "end",
          }}
          onUpdate={({ editor }) => {
            onChange(editor.getHTML());
            if (!editorInstance) {
              setEditorInstance(editor);
            }
          }}
          slotAfter={<ImageResizer />}
        >
          <style jsx global>{`
            .editor-container {
              position: relative;
              overflow: hidden;
              display: flex;
              flex-direction: column;
              cursor: text;
            }

            .notion-like-editor {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
                Oxygen, Ubuntu, Cantarell, sans-serif;
              height: 100%;
              width: 100%;
              overflow-y: auto;
              padding: 16px;
            }

            .notion-like-editor .ProseMirror {
              min-height: 100%;
              outline: none !important;
              caret-color: black;
              position: relative;
              word-wrap: break-word;
              white-space: pre-wrap;
              white-space: break-spaces;
              -webkit-font-variant-ligatures: none;
              font-variant-ligatures: none;
              font-feature-settings: "liga" 0;
              padding: 0;
              cursor: text;
            }

            /* Add transparent line at bottom to make clicks work */
            .notion-like-editor .ProseMirror::after {
              content: " ";
              display: block;
              height: 300px;
              pointer-events: none;
            }

            /* Ensure text colors are properly rendered */
            .notion-like-editor [style*="color"] {
              color: var(--tw-prose-body);
              color: attr(style color);
            }

            /* Apply specific color styles */
            .notion-like-editor span[style*="color"] {
              color: attr(style color) !important;
            }

            /* Improve paragraph spacing for Notion-like feel */
            .notion-like-editor p {
              margin-bottom: 0.5rem;
              margin-top: 0.5rem;
            }
          `}</style>

          {/* Command menu */}
          <EditorCommand className="z-50 h-auto max-h-[330px] overflow-y-auto rounded-md border border-muted bg-background px-1 py-2 shadow-md transition-all">
            <EditorCommandEmpty className="px-2 text-muted-foreground">
              No results
            </EditorCommandEmpty>
            <EditorCommandList>
              {suggestionItems.map((item: any) => (
                <EditorCommandItem
                  value={item.title}
                  onCommand={(val) => item.command?.(val)}
                  className={`flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent `}
                  key={item.title}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-muted bg-background">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </EditorCommandItem>
              ))}
            </EditorCommandList>
          </EditorCommand>

          {/* Formatting bubble */}
          <EditorBubble
            tippyOptions={{
              placement: "top",
            }}
            className="flex w-fit max-w-[90vw] overflow-hidden rounded-md border border-muted bg-background shadow-xl"
          >
            <Separator orientation="vertical" />
            <NodeSelector open={openNode} onOpenChange={setOpenNode} />
            <Separator orientation="vertical" />

            <LinkSelector open={openLink} onOpenChange={setOpenLink} />
            <Separator orientation="vertical" />
            <TextButtons />
            <Separator orientation="vertical" />
            <ColorSelector open={openColor} onOpenChange={setOpenColor} />
          </EditorBubble>
        </EditorContent>
      </div>
    </EditorRoot>
  );
};

export default Editor;
