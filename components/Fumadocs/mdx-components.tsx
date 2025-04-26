import defaultMdxComponents from "fumadocs-ui/mdx";
import { ImageZoom } from "fumadocs-ui/components/image-zoom";

import type { MDXComponents } from "mdx/types";
import { createGenerator } from "fumadocs-typescript";
import { AutoTypeTable } from "fumadocs-typescript/ui";

const generator = createGenerator();

/**
 * Custom MDX components with search functionality and image zoom
 * Following Quail's coding guidelines for clean, readable components
 */
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    AutoTypeTable: (props) => (
      <AutoTypeTable {...props} generator={generator} />
    ),
    img: (props) => <ImageZoom {...(props as any)} />,
    // Search: (props) => <Search {...props} />,
    ...components,
  };
}
