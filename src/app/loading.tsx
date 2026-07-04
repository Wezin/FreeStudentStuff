import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-8 px-4 py-8 sm:px-6">
      <Skeleton className="h-12 w-full max-w-md rounded-full" />
      <Skeleton className="aspect-[16/9] w-full rounded-3xl" />
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-64 w-60 shrink-0 rounded-3xl" />
        ))}
      </div>
    </div>
  );
}
