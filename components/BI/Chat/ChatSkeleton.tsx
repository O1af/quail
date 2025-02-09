import { Skeleton } from "@/components/ui/skeleton";

export function ChatSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className={`flex ${
            i % 2 === 0 ? "justify-end" : "justify-start"
          } gap-3 w-full`}
        >
          <div
            className={`flex flex-col gap-2 ${
              i % 2 === 0 ? "items-end" : "items-start"
            }`}
          >
            <Skeleton
              className={`h-4 w-24 ${i % 2 === 0 ? "ml-12" : "mr-12"}`}
            />
            <Skeleton className={`h-24 ${i % 2 === 0 ? "w-96" : "w-80"}`} />
          </div>
        </div>
      ))}
    </div>
  );
}
