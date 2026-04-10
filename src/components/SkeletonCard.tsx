export function SkeletonCard() {
  return (
    <div className="rounded-xl border bg-card p-4 space-y-3 animate-pulse">
      <div className="h-40 bg-muted rounded-lg" />
      <div className="h-4 bg-muted rounded w-3/4" />
      <div className="h-3 bg-muted rounded w-1/2" />
      <div className="h-8 bg-muted rounded w-1/3" />
    </div>
  );
}

export function SkeletonList({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );
}
