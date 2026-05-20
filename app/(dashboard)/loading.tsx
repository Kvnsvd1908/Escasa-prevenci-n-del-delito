export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        <div className="h-8 w-72 animate-pulse rounded bg-muted" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded bg-muted" />
      </header>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-lg border border-border bg-card p-5">
            <div className="h-3 w-36 animate-pulse rounded bg-muted" />
            <div className="mt-4 h-8 w-20 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 rounded-lg border border-border bg-card p-5 lg:col-span-2">
          <div className="h-5 w-48 animate-pulse rounded bg-muted" />
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-14 animate-pulse rounded-md border border-border bg-background" />
          ))}
        </div>
        <div className="space-y-4 rounded-lg border border-border bg-card p-5">
          <div className="h-5 w-24 animate-pulse rounded bg-muted" />
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="h-4 w-28 animate-pulse rounded bg-muted" />
              <div className="h-4 w-16 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
