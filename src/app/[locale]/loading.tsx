// Homepage loading skeleton — shown instantly while hero + products fetch
export default function HomeLoading() {
  return (
    <main>
      {/* Hero skeleton */}
      <div className="relative min-h-[85vh] bg-gray-100 animate-pulse" />

      {/* New In skeleton */}
      <section className="px-5 py-16">
        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[3/4] bg-gray-200 mb-3" />
              <div className="h-3 w-3/4 bg-gray-200 rounded mb-1.5" />
              <div className="h-3 w-1/2 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </section>

      {/* Collections skeleton */}
      <section className="px-5 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-200 animate-pulse" />
          ))}
        </div>
      </section>
    </main>
  );
}
