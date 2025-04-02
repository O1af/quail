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

const Editor = ({
  initialValue,
  onChange,
  height = "h-[calc(100vh-4rem)]",
}: EditorProp) => {
  const [openNode, setOpenNode] = useState(false);
  const [openColor, setOpenColor] = useState(false);
  const [openLink, setOpenLink] = useState(false);
  const [editorInstance, setEditorInstance] = useState<any>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  // Add state to track when images are being uploaded
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Custom image upload handler to track the upload state
  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      setIsUploadingImage(true);
      const url = await uploadFn(file);
      setTimeout(() => {
        // Ensure content is saved after image is inserted
        if (editorInstance) {
          onChange(editorInstance.getHTML());
        }
        setIsUploadingImage(false);
      }, 100);
      return url;
    } catch (error) {
      setIsUploadingImage(false);
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  // Handle direct clicks on the editor container
  useEffect(() => {
    if (editorInstance && editorContainerRef.current) {
      const container = editorContainerRef.current;

      const handleContainerClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;

        // Only handle clicks directly on the container or its immediate children
        // that aren't part of the actual editor content
        if (
          target === container ||
          (target.parentElement === container &&
            !target.closest(".ProseMirror-content")) ||
          target.classList.contains("notion-like-editor")
        ) {
          e.preventDefault();
          // Focus at the end of the editor
          setTimeout(() => {
            editorInstance.commands.focus("end");
          }, 0);
        }
      };

      container.addEventListener("click", handleContainerClick, true); // Use capture phase

      return () => {
        container.removeEventListener("click", handleContainerClick, true);
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

  // Add a more direct click handler for the empty space
  const handleEmptySpaceClick = (e: React.MouseEvent) => {
    if (editorInstance && !editorInstance.isFocused) {
      // Prevent default to ensure our handler runs
      e.preventDefault();
      e.stopPropagation();

      // Force focus at the end
      editorInstance.commands.focus("end");
    }
  };

  return (
    <EditorRoot>
      <div
        className="editor-container relative cursor-text"
        style={{ height, minHeight: "200px" }}
        ref={editorContainerRef}
        onClick={handleEmptySpaceClick}
      >
        {/* Add a full-height, full-width clickable backdrop */}
        <div
          className="absolute inset-0 w-full h-full cursor-text"
          onClick={handleEmptySpaceClick}
          aria-hidden="true"
        />

        <EditorContent
          ref={editorRef}
          className="h-full notion-like-editor relative z-10"
          {...(initialValue && { initialContent: initialValue })}
          extensions={extensions}
          editorProps={{
            handleDOMEvents: {
              keydown: (_view, event) => handleCommandNavigation(event),
              mousedown: (view, event) => {
                // Special handling for clicks in the editor but not on content
                const target = event.target as HTMLElement;
                if (target.classList.contains("ProseMirror")) {
                  setTimeout(() => {
                    editorInstance?.commands.focus("end");
                  }, 0);
                  return true;
                }
                return false;
              },
            },
            // Improve image paste handling with more explicit options
            handlePaste: (view, event) =>
              handleImagePaste(view, event, uploadFn),
            // Improve image drop handling with more explicit options
            handleDrop: (view, event, _slice, moved) =>
              handleImageDrop(view, event, moved, uploadFn),

            attributes: {
              class: `prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full h-full`,
            },
            autofocus: "end",
          }}
          onUpdate={({ editor }) => {
            // When editor updates, save the content
            if (!isUploadingImage) {
              const html = editor.getHTML();
              onChange(html);
            }

            // Store editor instance for focus management
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
              width: 100%;
              height: 100%;
            }

            .notion-like-editor {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
                Oxygen, Ubuntu, Cantarell, sans-serif;
              height: 100%;
              width: 100%;
              overflow-y: auto;
              padding: 16px;
              display: flex;
              flex-direction: column;
              position: relative;
              z-index: 10;
            }

            /* Make the ProseMirror editor fill the entire container */
            .notion-like-editor .ProseMirror {
              flex-grow: 1;
              min-height: 100%;
              outline: none !important;
              caret-color: currentColor;
              position: relative;
              word-wrap: break-word;
              white-space: pre-wrap;
              white-space: break-spaces;
              -webkit-font-variant-ligatures: none;
              font-variant-ligatures: none;
              font-feature-settings: "liga" 0;
              padding: 0;
              cursor: text;
              display: flex;
              flex-direction: column;
            }

            /* Create a full-page placeholder that's always at the end */
            .notion-like-editor .ProseMirror::after {
              content: "";
              flex-grow: 1;
              pointer-events: all;
              min-height: 500px; /* Make this much larger to ensure it fills the space */
              width: 100%;
              cursor: text;
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

            /* Add better styling for images */
            .notion-like-editor img {
              max-width: 100%;
              height: auto;
              border-radius: 4px;
              margin: 1rem 0;
            }

            /* Ensure image captions are styled properly */
            .notion-like-editor .image-caption {
              text-align: center;
              font-size: 0.875rem;
              color: var(--tw-prose-captions);
              margin-top: -0.5rem;
              margin-bottom: 1rem;
            }
          `}</style>

          {/* Add an invisible element that captures clicks in empty space */}
          <div
            className="absolute inset-0 z-[-1]"
            onClick={() => editorInstance?.commands.focus("end")}
            aria-hidden="true"
          />

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
