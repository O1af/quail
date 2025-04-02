"use client";

import Editor from "@/app/app/(bi)/notes/components/advanced-editor";
import { useState, useRef, useEffect } from "react";

interface TailwindEditorProps {}

/**
 * TailwindEditor component that wraps the advanced editor
 * Manages content state and provides editor change handling
 */
const TailwindEditor: React.FC<TailwindEditorProps> = () => {
  const [content, setContent] = useState<string>("");
  const containerRef = useRef<HTMLDivElement>(null);
  const [editorHeight, setEditorHeight] = useState<string>("100%");

  // Ensure we get accurate measurements
  useEffect(() => {
    if (containerRef.current) {
      // Set height to force the editor to fill the container completely
      setEditorHeight(`${containerRef.current.clientHeight}px`);
    }
  }, []);

  const handleEditorChange = (value: string) => {
    // Store the complete HTML including images
    setContent(value);

    // For debugging - uncomment to see the content being saved
    // console.log("Editor content updated:", value);
  };

  // Save content to localStorage for persistence
  useEffect(() => {
    if (content) {
      localStorage.setItem("editor-content", content);
    }
  }, [content]);

  // Load content from localStorage on initial render
  useEffect(() => {
    const savedContent = localStorage.getItem("editor-content");
    if (savedContent) {
      setContent(savedContent);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="border rounded-md h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)] mx-16 my-8"
    >
      <Editor
        onChange={handleEditorChange}
        initialValue={content}
        height={editorHeight}
      />
    </div>
  );
};
export default TailwindEditor;
