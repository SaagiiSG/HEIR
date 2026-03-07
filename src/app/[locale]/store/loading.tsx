export default function StoreLoading() {
  return (
    <main className="px-5 pt-10 pb-16">
      {/* Top bar skeleton */}
      <div className="flex items-center justify-between gap-6 mb-8 border-b border-gray-200 pb-6">
        <div className="h-2.5 w-28 bg-gray-200 animate-pulse" />
        <div className="h-8 w-64 bg-gray-200 animate-pulse ml-auto" />
      </div>

      {/* Filter bar skeleton */}
      <div className="flex gap-6 border-b border-gray-200 pb-6 mb-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-2.5 w-12 bg-gray-200 animate-pulse" />
        ))}
      </div>

      {/* Product grid skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[3/4] bg-gray-200 mb-3" />
            <div className="h-2 w-16 bg-gray-200 mb-1.5" />
            <div className="h-2.5 w-3/4 bg-gray-200 mb-1.5" />
            <div className="h-2.5 w-1/3 bg-gray-200" />
          </div>
        ))}
      </div>
    </main>
  );
}
