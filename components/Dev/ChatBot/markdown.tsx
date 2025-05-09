import React, { memo, useMemo } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./code-block";
import Link from "next/link";

// Create wrapper components to handle type conversions
const CodeWrapper = (props: any) => {
  return <CodeBlock {...props} />;
};

const components: Partial<Components> = {
  p: ({ node, children }) => <p className="break-words">{children}</p>, // Ensure p tag and add break-words
  code: CodeWrapper, // Using wrapper component
  pre: ({ children }) => (
    <pre className="overflow-x-auto p-4 my-3 rounded-lg">{children}</pre>
  ),
  ol: ({ children, ...props }) => (
    <ol className="list-decimal list-outside ml-4 my-2" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="py-1 break-words" {...props}>
      {" "}
      {/* Added break-words */}
      {children}
    </li>
  ),
  ul: ({ children, ...props }) => (
    <ul className="list-disc list-outside ml-4 my-2" {...props}>
      {children}
    </ul>
  ),
  strong: ({ children, ...props }) => (
    <span className="font-semibold" {...props}>
      {children}
    </span>
  ),
  a: ({ href, children, ...props }) => {
    if (href?.startsWith("/") || href?.startsWith("#")) {
      return (
        <Link href={href} {...props}>
          {children}
        </Link>
      );
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  },
  h1: ({ children, ...props }) => (
    <h1 className="text-3xl font-semibold mt-6 mb-2" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 className="text-2xl font-semibold mt-6 mb-2" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="text-xl font-semibold mt-6 mb-2" {...props}>
      {children}
    </h3>
  ),
};

const remarkPlugins = [remarkGfm];

const NonMemoizedMarkdown = ({ children }: { children: string }) => {
  const content = useMemo(() => {
    return (
      <ReactMarkdown remarkPlugins={remarkPlugins} components={components}>
        {children}
      </ReactMarkdown>
    );
  }, [children]);

  return content;
};

export const Markdown = memo(
  NonMemoizedMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children
);
