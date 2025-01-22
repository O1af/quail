import ReactMarkdown from "react-markdown";
import { termsContent } from "./termsContent";

const MarkdownComponents = {
  h1: ({ children }: any) => (
    <h1 className="text-4xl font-bold mb-8 text-gray-900">{children}</h1>
  ),
  h2: ({ children }: any) => (
    <h2 className="text-3xl font-semibold mt-8 mb-4 text-gray-800">
      {children}
    </h2>
  ),
  h3: ({ children }: any) => (
    <h3 className="text-2xl font-semibold mt-6 mb-3 text-gray-700">
      {children}
    </h3>
  ),
  h4: ({ children }: any) => (
    <h4 className="text-xl font-medium mt-4 mb-2 text-gray-700">{children}</h4>
  ),
  p: ({ children }: any) => (
    <p className="text-gray-600 mb-4 leading-relaxed">{children}</p>
  ),
  ul: ({ children }: any) => (
    <ul className="list-disc pl-6 mb-4 text-gray-600">{children}</ul>
  ),
  li: ({ children }: any) => <li className="mb-2">{children}</li>,
  hr: () => <hr className="my-8 border-t border-gray-200" />,
  a: ({ href, children }: any) => (
    <a href={href} className="text-blue-600 hover:text-blue-800 underline">
      {children}
    </a>
  ),
};

export const Terms = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <article className="prose prose-lg max-w-none">
        <ReactMarkdown components={MarkdownComponents}>
          {termsContent}
        </ReactMarkdown>
      </article>
    </div>
  );
};
