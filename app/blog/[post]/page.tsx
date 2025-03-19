import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { MDXRemote } from "next-mdx-remote/rsc";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { Header } from "@/components/Static/Landing/header";
import dynamic from "next/dynamic";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Metadata } from "next";

const Footer = dynamic(() => import("@/components/Static/Footer"));

// Get base URL from environment or fallback to production URL
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://quailbi.com";

// Define custom components for MDX
const components = {
  Image,
  h1: (props: any) => (
    <h1 className="text-4xl font-bold mt-8 mb-4" {...props} />
  ),
  h2: (props: any) => (
    <h2 className="text-3xl font-bold mt-8 mb-4" {...props} />
  ),
  h3: (props: any) => (
    <h3 className="text-2xl font-bold mt-6 mb-3" {...props} />
  ),
  h4: (props: any) => <h4 className="text-xl font-bold mt-4 mb-2" {...props} />,
  p: (props: any) => <p className="my-4 leading-7" {...props} />,
  ul: (props: any) => <ul className="my-6 ml-6 list-disc" {...props} />,
  ol: (props: any) => <ol className="my-6 ml-6 list-decimal" {...props} />,
  li: (props: any) => <li className="mt-2" {...props} />,
  blockquote: (props: any) => (
    <blockquote
      className="border-l-4 border-gray-300 pl-4 my-6 italic"
      {...props}
    />
  ),
  a: (props: any) => <a className="text-blue-600 hover:underline" {...props} />,
  table: (props: any) => (
    <table className="w-full text-left border-collapse my-6" {...props} />
  ),
  th: (props: any) => (
    <th className="px-4 py-2 border border-gray-300 bg-gray-100" {...props} />
  ),
  td: (props: any) => (
    <td className="px-4 py-2 border border-gray-300" {...props} />
  ),
  code: (props: any) => {
    if (typeof props.children === "string") {
      return (
        <code
          className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-gray-800 dark:text-gray-200 text-sm font-mono"
          {...props}
        />
      );
    }
    return <code {...props} />;
  },
  pre: (props: any) => {
    // Extract language from className (format: language-*)
    const className = props.children?.props?.className || "";
    const language = className.replace("language-", "");

    // Get the code content
    const code = props.children?.props?.children;

    if (typeof code === "string" && language) {
      return (
        <div className="code-block-wrapper my-6 rounded-lg overflow-hidden">
          <div className="bg-gray-800 px-4 py-2 text-gray-400 text-xs font-mono flex justify-between items-center">
            <span>{language}</span>
          </div>
          <SyntaxHighlighter
            language={language}
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              borderRadius: "0 0 0.5rem 0.5rem",
              padding: "1.5rem",
            }}
            showLineNumbers
            lineNumberStyle={{
              minWidth: "3em",
              paddingRight: "1em",
              color: "#6e7681",
            }}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      );
    }

    return (
      <pre
        className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-6 font-mono"
        {...props}
      />
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

    // Convert relative image paths to absolute URLs
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

  // Check if the file exists
  try {
    if (!fs.existsSync(postPath)) {
      return notFound();
    }
  } catch (err) {
    return notFound();
  }

  // Read the file content
  const fileContent = fs.readFileSync(postPath, "utf8");
  const { content, data } = matter(fileContent);

  return (
    <div className="flex min-h-screen flex-col overflow-hidden">
      <Header />
      <main className="flex-1 pt-20">
        <div className="container mx-auto py-10 px-4">
          <article className="prose prose-lg max-w-3xl mx-auto">
            <header className="mb-8 text-center">
              <h1 className="text-4xl md:text-5xl font-extrabold mb-3 leading-tight">
                {data.title}
              </h1>
              {data.description && (
                <p className="text-lg text-gray-500 dark:text-gray-400 mb-4 leading-relaxed max-w-2xl mx-auto">
                  {data.description}
                </p>
              )}
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 mb-6">
                <time className="text-sm font-medium">
                  {new Date(data.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </div>

              {data.image && (
                <div className="relative w-full max-w-3xl mx-auto aspect-[16/9] max-h-[400px] rounded-xl overflow-hidden shadow-lg">
                  <Image
                    src={data.image}
                    alt={data.title}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                  />
                </div>
              )}
            </header>

            <Separator className="my-10" />

            <div className="mdx-content">
              <MDXRemote source={content} components={components} />
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
