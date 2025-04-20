import Image from "next/image";
import { CalendarDays } from "lucide-react";

interface BlogPostHeaderProps {
  title: string;
  description?: string;
  date: string;
  image?: string;
}

export function BlogPostHeader({
  title,
  description,
  date,
  image,
}: BlogPostHeaderProps) {
  return (
    <header className="mb-10 text-center">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight tracking-tight">
        {title}
      </h1>
      {description && (
        <p className="text-xl text-muted-foreground mt-2 mb-6 leading-relaxed max-w-2xl mx-auto">
          {description}
        </p>
      )}
      <div className="flex justify-center items-center text-sm text-muted-foreground mb-8">
        <CalendarDays className="mr-2 h-4 w-4" />
        <time>
          {new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
      </div>

      {image && (
        <div className="relative w-full max-w-3xl mx-auto aspect-16/9 max-h-[450px] rounded-xl overflow-hidden shadow-lg mb-8">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 700px"
          />
        </div>
      )}
    </header>
  );
}
