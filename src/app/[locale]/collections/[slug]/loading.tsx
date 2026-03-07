export default function CollectionLoading() {
  return (
    <main className="px-5 py-12">
      <div className="h-48 bg-gray-200 animate-pulse rounded mb-10" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[3/4] bg-gray-200 mb-3" />
            <div className="h-3 w-3/4 bg-gray-200 rounded mb-1.5" />
            <div className="h-3 w-1/2 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </main>
  );
}
