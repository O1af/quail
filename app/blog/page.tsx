import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { Header } from "@/components/Static/Landing/header";
import dynamic from "next/dynamic";
import { Metadata } from "next";
import { BlogPostCard } from "@/components/Static/blog/BlogPostCard"; // Import the new card component

const Footer = dynamic(() => import("@/components/Static/Footer"));

// Get base URL from environment or fallback to production URL
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://quailbi.com";

// Add metadata for the blog index page
export const metadata: Metadata = {
  title: "Engineering Blog | Quail",
  description:
    "Read the latest articles and insights from the Quail engineering team",
  openGraph: {
    title: "Engineering Blog | Quail",
    description:
      "Read the latest articles and insights from the Quail engineering team",
    url: `${baseUrl}/blog`,
    type: "website",
    images: [
      {
        url: `${baseUrl}/quail_logo_white.png`,
        width: 1200,
        height: 630,
        alt: "Quail Engineering Blog",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Engineering Blog | Quail",
    description:
      "Read the latest articles and insights from the Quail engineering team",
    images: [`${baseUrl}/quail_logo_white.png`],
  },
};

export default function BlogPage() {
  // Get all MDX files from the content directory
  const contentDir = path.join(process.cwd(), "content");
  const files = fs
    .readdirSync(contentDir)
    .filter((file) => file.endsWith(".mdx"));

  // Read and parse each file
  const posts = files.map((file) => {
    const filePath = path.join(contentDir, file);
    const fileContent = fs.readFileSync(filePath, "utf8");
    const { data } = matter(fileContent);

    // Validate required frontmatter properties
    if (!data.title || !data.date) {
      console.warn(
        `Post ${file} is missing required frontmatter properties (title or date)`
      );
    }

    return {
      slug: file.replace(".mdx", ""),
      frontmatter: {
        ...data,
        title: data.title || "Untitled Post",
        date: data.date || new Date().toISOString(),
      },
    };
  });

  // Sort posts by date, newest first
  const sortedPosts = posts.sort(
    (a, b) =>
      new Date(b.frontmatter.date).getTime() -
      new Date(a.frontmatter.date).getTime()
  );

  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-background">
      <Header />
      <main className="flex-1 pt-16">
        {/* Minimal Title Section */}
        <section className="py-6 md:py-8 border-b">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <h1 className="text-2xl md:text-3xl font-medium mb-2 tracking-tight text-center">
                Engineering Blog
              </h1>
              <p className="text-sm md:text-base text-muted-foreground text-center">
                Insights and updates from the Quail team
              </p>
            </div>
          </div>
        </section>

        {/* Blog Post Grid */}
        <section className="py-10 md:py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Use sortedPosts and the BlogPostCard component */}
              {sortedPosts.map((post) => (
                <BlogPostCard key={post.slug} post={post} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
