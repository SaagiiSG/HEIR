export default function CartLoading() {
  return (
    <main className="px-5 py-12 max-w-[900px] mx-auto animate-pulse">
      <div className="h-6 w-32 bg-gray-200 rounded mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-12">
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-20 h-24 bg-gray-200 rounded shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/2 bg-gray-200 rounded" />
                <div className="h-3 w-1/3 bg-gray-200 rounded" />
                <div className="h-3 w-1/4 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <div className="h-4 w-32 bg-gray-200 rounded" />
          <div className="h-3 w-full bg-gray-200 rounded" />
          <div className="h-3 w-full bg-gray-200 rounded" />
          <div className="h-10 w-full bg-gray-200 rounded mt-4" />
        </div>
      </div>
    </main>
  );
}
