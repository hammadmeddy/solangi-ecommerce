export default function CategoryLoading() {
  return (
    <section className="wrap py-10 md:py-14">
      <div className="mb-6 h-4 w-40 animate-pulse rounded bg-[var(--mist)]" />
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-3">
          <div className="h-3 w-24 animate-pulse rounded bg-[var(--mist)]" />
          <div className="h-10 w-64 max-w-full animate-pulse rounded bg-[var(--mist)]" />
          <div className="h-4 w-80 max-w-full animate-pulse rounded bg-[var(--mist)]" />
        </div>
        <div className="h-24 w-24 animate-pulse rounded-xl bg-[var(--mist)]" />
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 md:gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-xl border border-[var(--line)] bg-white/70"
          >
            <div className="aspect-square animate-pulse bg-[var(--mist)]" />
            <div className="space-y-2 p-4">
              <div className="h-3 w-1/3 animate-pulse rounded bg-[var(--mist)]" />
              <div className="h-4 w-4/5 animate-pulse rounded bg-[var(--mist)]" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-[var(--mist)]" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
