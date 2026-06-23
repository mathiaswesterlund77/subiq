export default function DashboardLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>

      {/* Title row */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-white/10" />
        <div className="h-8 w-28 animate-pulse rounded-lg bg-white/10" />
      </div>

      {/* Banner */}
      <div className="h-16 animate-pulse rounded-2xl border border-white/10 bg-white/5" />

      {/* Card grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-2xl border border-white/10 bg-white/5"
          />
        ))}
      </div>

      {/* Wider blocks */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-64 animate-pulse rounded-2xl border border-white/10 bg-white/5" />
        <div className="h-64 animate-pulse rounded-2xl border border-white/10 bg-white/5" />
      </div>
    </div>
  );
}
