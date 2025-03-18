import fs from "fs";
import path from "path";
import matter from "gray-matter";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Header } from "@/components/Static/Landing/header";
import dynamic from "next/dynamic";
import { Metadata } from "next";

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

    return {
      slug: file.replace(".mdx", ""),
      frontmatter: data,
    };
  });

  return (
    <div className="flex min-h-screen flex-col overflow-hidden">
      <Header />
      <main className="flex-1 pt-20">
        <div className="container mx-auto py-10">
          <h1 className="text-4xl font-bold mb-8 text-center">
            Engineering Blog
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link href={`/blog/${post.slug}`} key={post.slug}>
                <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow">
                  {post.frontmatter.image && (
                    <div className="relative w-full h-48">
                      <Image
                        src={post.frontmatter.image}
                        alt={post.frontmatter.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{post.frontmatter.title}</CardTitle>
                    <CardDescription>
                      {new Date(post.frontmatter.date).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-3">
                      {post.frontmatter.description}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <div className="flex items-center text-sm text-muted-foreground">
                      Read more →
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
