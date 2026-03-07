export default function AccountLoading() {
  return (
    <main className="px-5 py-12 max-w-[900px] mx-auto animate-pulse">
      <div className="h-6 w-32 bg-gray-200 rounded mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded" />
        ))}
      </div>
      <div className="h-4 w-28 bg-gray-200 rounded mb-4" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-16 bg-gray-200 rounded mb-3" />
      ))}
    </main>
  );
}
