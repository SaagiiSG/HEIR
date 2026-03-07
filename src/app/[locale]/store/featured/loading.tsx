export default function FeaturedLoading() {
  return (
    <main>
      {/* Black hero skeleton */}
      <section className="bg-black flex flex-col items-center justify-center px-5" style={{ minHeight: "42vh" }}>
        <div className="h-20 w-64 bg-gray-800 animate-pulse rounded mb-4" />
        <div className="h-3 w-48 bg-gray-800 animate-pulse rounded" />
      </section>

      {/* Portrait card skeletons */}
      <section className="max-w-[1200px] mx-auto px-5 py-16">
        <div className="grid grid-cols-2 gap-x-5 gap-y-12">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[2/3] bg-gray-200" />
              <div className="mt-3 space-y-1.5">
                <div className="h-2.5 w-16 bg-gray-200 rounded" />
                <div className="h-3 w-3/4 bg-gray-200 rounded" />
                <div className="h-3 w-1/3 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
