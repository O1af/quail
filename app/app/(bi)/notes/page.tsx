"use client";

import Editor from "@/app/app/(bi)/notes/components/advanced-editor";
import { useState } from "react";

interface TailwindEditorProps {}

/**
 * TailwindEditor component that wraps the advanced editor
 * Manages content state and provides editor change handling
 */
const TailwindEditor: React.FC<TailwindEditorProps> = () => {
  const [content, setContent] = useState<string>("");

  const handleEditorChange = (value: string) => {
    setContent(value);
  };

  return (
    <div className="border rounded-md h-[600px]">
      <Editor
        onChange={handleEditorChange}
        initialValue={content}
        height="100%"
      />
    </div>
  );
};
export default TailwindEditor;
