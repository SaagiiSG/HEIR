export default function DropsLoading() {
  return (
    <main className="px-5 py-12 max-w-[1100px] mx-auto animate-pulse">
      <div className="h-6 w-20 bg-gray-200 rounded mb-10" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="aspect-video bg-gray-200 rounded" />
        ))}
      </div>
    </main>
  );
}
