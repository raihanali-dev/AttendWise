import { Skeleton } from "@/components/ui/skeleton";

export function RouteLoading() {
  return (
    <main className="flex-1 space-y-6 p-4 lg:p-8">
      <div className="space-y-4">
        <div className="h-8 w-48 rounded-2xl bg-muted/30 animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Skeleton className="h-44 md:h-52" />
          <Skeleton className="h-44 md:h-52" />
          <Skeleton className="h-44 md:h-52" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      </div>
    </main>
  );
}
