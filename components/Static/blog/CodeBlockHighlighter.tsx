"use client";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  vscDarkPlus,
  oneLight, // Corrected import name
} from "react-syntax-highlighter/dist/cjs/styles/prism"; // Import light theme
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface CodeBlockHighlighterProps {
  language: string;
  code: string;
}

export function CodeBlockHighlighter({
  language,
  code,
}: CodeBlockHighlighterProps) {
  const { resolvedTheme } = useTheme();
  const [currentStyle, setCurrentStyle] = useState(vscDarkPlus); // Default to dark

  useEffect(() => {
    // Use the corrected theme name 'oneLight'
    setCurrentStyle(resolvedTheme === "light" ? oneLight : vscDarkPlus);
  }, [resolvedTheme]);

  // Prevent hydration mismatch by delaying render until theme is resolved
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <SyntaxHighlighter
      language={language}
      style={currentStyle}
      customStyle={{
        margin: 0,
        padding: "1rem 1.5rem",
        fontSize: "0.875rem",
        lineHeight: "1.7",
        borderRadius: "0 0 0.5rem 0.5rem",
      }}
      showLineNumbers
      lineNumberStyle={{
        minWidth: "2.5em",
        paddingRight: "1em",
        color:
          resolvedTheme === "light"
            ? "rgba(27, 31, 35, 0.3)"
            : "rgb(110, 118, 129)", // Adjust line number color based on theme
        userSelect: "none",
      }}
      codeTagProps={{
        style: {
          fontFamily: "var(--font-mono)",
        },
      }}
    >
      {code.trim()}
    </SyntaxHighlighter>
  );
}
