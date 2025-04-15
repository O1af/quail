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
import { ArrowRight } from "lucide-react";

interface BlogPostCardProps {
  post: {
    slug: string;
    frontmatter: {
      [key: string]: any; // Allow any frontmatter fields
      title: string;
      date: string;
      description?: string;
      image?: string;
    };
  };
}

export function BlogPostCard({ post }: BlogPostCardProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      key={post.slug}
      className="group block" // Add group class for hover effects
    >
      <Card className="h-full overflow-hidden transition-all duration-300 ease-in-out group-hover:shadow-xl group-hover:-translate-y-1 bg-card">
        {post.frontmatter.image && (
          <div className="relative w-full h-48 overflow-hidden">
            <Image
              src={post.frontmatter.image}
              alt={post.frontmatter.title}
              fill
              className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}
        <CardHeader>
          <CardTitle className="text-xl group-hover:text-primary transition-colors">
            {post.frontmatter.title}
          </CardTitle>
          <CardDescription>
            {new Date(post.frontmatter.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="line-clamp-3 text-sm text-muted-foreground">
            {post.frontmatter.description}
          </p>
        </CardContent>
        <CardFooter>
          <div className="flex items-center text-sm font-medium text-primary">
            Read more
            <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
