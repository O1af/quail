import { DocsLayout, type DocsLayoutProps } from "fumadocs-ui/layouts/notebook";
import type { ReactNode } from "react";
import { baseOptions } from "@/app/layout.config";
import { source } from "@/lib/source";
import { GithubInfo } from "fumadocs-ui/components/github-info";
import { NewspaperIcon } from "lucide-react";
import Link from "next/link";

const docsOptions: DocsLayoutProps = {
  ...baseOptions,
  tree: source.pageTree,
  links: [
    {
      type: "custom",
      children: (
        <GithubInfo
          owner="QuailAI"
          repo="azure-ai-provider"
          className="lg:-mx-2 hover:opacity-80 transition-opacity"
        />
      ),
    },
    {
      type: "custom",
      children: (
        <Link
          href="/blog"
          className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <NewspaperIcon className="h-4 w-4" />
          <span>Blog</span>
        </Link>
      ),
    },
  ],
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      sidebar={{
        tabs: [
          {
            title: "Components",
            description: "Hello World!",
            // active for `/docs/components` and sub routes like `/docs/components/button`
            url: "/docs/components",

            // optionally, you can specify a set of urls which activates the item
            // urls: new Set(['/docs/test', '/docs/components']),
          },
        ],
      }}
      {...docsOptions}
    >
      {children}
    </DocsLayout>
  );
}
