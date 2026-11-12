export default function ProductLoading() {
  return (
    <section className="wrap py-10 md:py-14">
      <div className="mb-6 h-4 w-48 animate-pulse rounded bg-[var(--mist)]" />
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="min-h-[360px] animate-pulse rounded-2xl bg-[var(--mist)]" />
        <div className="space-y-4">
          <div className="h-3 w-28 animate-pulse rounded bg-[var(--mist)]" />
          <div className="h-10 w-3/4 animate-pulse rounded bg-[var(--mist)]" />
          <div className="h-4 w-full animate-pulse rounded bg-[var(--mist)]" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-[var(--mist)]" />
          <div className="h-10 w-40 animate-pulse rounded bg-[var(--mist)]" />
          <div className="h-12 w-full animate-pulse rounded-full bg-[var(--mist)]" />
        </div>
      </div>
    </section>
  );
}
