export default function ProductLoading() {
  return (
    <main className="px-5 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-[1100px] mx-auto">
        {/* Image skeleton */}
        <div className="aspect-[3/4] bg-gray-200 animate-pulse" />

        {/* Info skeleton */}
        <div className="space-y-6 md:pt-4 animate-pulse">
          <div className="space-y-3">
            <div className="h-3 w-12 bg-gray-200 rounded" />
            <div className="h-6 w-2/3 bg-gray-200 rounded" />
            <div className="h-5 w-24 bg-gray-200 rounded" />
          </div>

          {/* Variant skeleton */}
          <div className="space-y-3">
            <div className="h-3 w-20 bg-gray-200 rounded" />
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-9 w-12 bg-gray-200 rounded" />
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-2">
            <div className="h-12 w-full bg-gray-200 rounded" />
            <div className="h-12 w-full bg-gray-200 rounded" />
          </div>

          {/* Description */}
          <div className="border-t border-gray-100 pt-6 space-y-2">
            <div className="h-3 w-24 bg-gray-200 rounded" />
            <div className="h-3 w-full bg-gray-200 rounded" />
            <div className="h-3 w-5/6 bg-gray-200 rounded" />
            <div className="h-3 w-4/6 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    </main>
  );
}
