import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { MDXRemote } from "next-mdx-remote/rsc";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { Header } from "@/components/Static/Landing/header";
import dynamic from "next/dynamic";
import { Metadata } from "next";
import { CodeBlockCopyButton } from "@/components/Static/blog/CodeBlockCopyButton";
import { CodeBlockHighlighter } from "@/components/Static/blog/CodeBlockHighlighter"; // Import the highlighter wrapper
import { BlogPostHeader } from "@/components/Static/blog/BlogPostHeader"; // Import the post header component

const Footer = dynamic(() => import("@/components/Static/Footer"));

// Get base URL from environment or fallback to production URL
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://quailbi.com";

// Define custom components for MDX
const components = {
  Image: (props: any) => (
    <Image
      {...props}
      className="rounded-lg my-6 shadow-md"
      sizes="(max-width: 768px) 100vw, 700px"
      alt={props.alt || "Image"}
    />
  ),
  h1: (props: any) => (
    <h1
      className="text-3xl md:text-4xl font-bold mt-12 mb-6 scroll-m-20 tracking-tight"
      {...props}
    />
  ),
  h2: (props: any) => (
    <h2
      className="text-2xl md:text-3xl font-semibold mt-10 mb-5 border-b pb-2 scroll-m-20 tracking-tight"
      {...props}
    />
  ),
  h3: (props: any) => (
    <h3
      className="text-xl md:text-2xl font-semibold mt-8 mb-4 scroll-m-20 tracking-tight"
      {...props}
    />
  ),
  h4: (props: any) => (
    <h4
      className="text-lg md:text-xl font-semibold mt-6 mb-3 scroll-m-20 tracking-tight"
      {...props}
    />
  ),
  p: (props: any) => <p className="my-5 leading-7 not-first:mt-6" {...props} />,
  ul: (props: any) => (
    <ul className="my-6 ml-6 list-disc [&>li]:mt-2" {...props} />
  ),
  ol: (props: any) => (
    <ol className="my-6 ml-6 list-decimal [&>li]:mt-2" {...props} />
  ),
  li: (props: any) => <li className="mt-2" {...props} />,
  blockquote: (props: any) => (
    <blockquote
      className="border-l-4 border-primary pl-4 my-6 italic text-muted-foreground"
      {...props}
    />
  ),
  a: (props: any) => (
    <a className="text-primary hover:underline font-medium" {...props} />
  ),
  table: (props: any) => (
    <div className="my-6 w-full overflow-y-auto">
      <table className="w-full" {...props} />
    </div>
  ),
  th: (props: any) => (
    <th
      className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right"
      {...props}
    />
  ),
  td: (props: any) => (
    <td
      className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right"
      {...props}
    />
  ),
  code: (props: any) => {
    if (typeof props.children === "string") {
      return (
        <code
          className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold"
          {...props}
        />
      );
    }
    return <code {...props} />;
  },
  pre: (props: any) => {
    const className = props.children?.props?.className || "";
    const language = className.replace("language-", "");
    const code = props.children?.props?.children;

    if (typeof code === "string" && language) {
      return (
        <div className="code-block-wrapper not-prose relative group my-8 rounded-lg border dark:border-zinc-800">
          <div className="flex justify-between items-center px-4 py-2 border-b bg-gray-100 dark:bg-zinc-800 dark:border-zinc-700 rounded-t-lg">
            <span className="text-xs font-mono text-muted-foreground">
              {language}
            </span>
            <CodeBlockCopyButton
              code={code}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </div>
          <CodeBlockHighlighter language={language} code={code} />
        </div>
      );
    }

    return (
      <pre
        className="mt-6 mb-8 rounded-lg border bg-muted p-4 overflow-x-auto"
        {...props}
      >
        <code className="relative rounded font-mono text-sm font-semibold text-foreground">
          {props.children}
        </code>
      </pre>
    );
  },
};

// Get static params for all posts
export async function generateStaticParams() {
  const contentDir = path.join(process.cwd(), "content");
  const files = fs
    .readdirSync(contentDir)
    .filter((file) => file.endsWith(".mdx"));

  return files.map((file) => ({
    post: file.replace(".mdx", ""),
  }));
}

// Generate metadata for the blog post
export async function generateMetadata({
  params,
}: {
  params: Promise<{ post: string }>;
}): Promise<Metadata> {
  const { post } = await params;
  const postPath = path.join(process.cwd(), "content", `${post}.mdx`);

  try {
    if (!fs.existsSync(postPath)) {
      return {};
    }

    const fileContent = fs.readFileSync(postPath, "utf8");
    const { data } = matter(fileContent);

    const title = `${data.title} | Quail Blog`;
    const description = data.description || "Quail engineering blog post";
    const url = `${baseUrl}/blog/${post}`;

    let imageUrl = data.image || "/quail_logo_white.png";
    if (imageUrl.startsWith("/")) {
      imageUrl = `${baseUrl}${imageUrl}`;
    }

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "article",
        publishedTime: data.date,
        url,
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: data.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imageUrl],
      },
    };
  } catch (err) {
    return {};
  }
}

// Blog post page component
export default async function BlogPost({
  params,
}: {
  params: Promise<{ post: string }>;
}) {
  const { post } = await params;
  const postPath = path.join(process.cwd(), "content", `${post}.mdx`);

  try {
    if (!fs.existsSync(postPath)) {
      return notFound();
    }
  } catch (err) {
    return notFound();
  }

  const fileContent = fs.readFileSync(postPath, "utf8");
  const { content, data } = matter(fileContent);

  return (
    <div className="flex min-h-screen flex-col overflow-hidden">
      <Header />
      <main className="flex-1 pt-20 bg-background">
        <div className="container mx-auto py-16 px-4">
          <article className="prose prose-lg dark:prose-invert max-w-3xl mx-auto">
            <BlogPostHeader
              title={data.title}
              description={data.description}
              date={data.date}
              image={data.image}
            />

            <Separator className="my-12" />

            <MDXRemote source={content} components={components} />
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
