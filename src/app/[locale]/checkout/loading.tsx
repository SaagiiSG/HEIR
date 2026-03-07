export default function CheckoutLoading() {
  return (
    <main className="px-5 py-12 max-w-[900px] mx-auto animate-pulse">
      <div className="h-6 w-32 bg-gray-200 rounded mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-12">
        <div className="space-y-4">
          <div className="h-3 w-28 bg-gray-200 rounded mb-5" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-11 w-full bg-gray-200 rounded" />
          ))}
          <div className="h-12 w-full bg-gray-200 rounded mt-6" />
        </div>
        <div className="space-y-3">
          <div className="h-3 w-36 bg-gray-200 rounded mb-5" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex justify-between">
              <div className="h-3 w-32 bg-gray-200 rounded" />
              <div className="h-3 w-20 bg-gray-200 rounded" />
            </div>
          ))}
          <div className="border-t border-gray-100 pt-3 flex justify-between">
            <div className="h-4 w-16 bg-gray-200 rounded" />
            <div className="h-4 w-24 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    </main>
  );
}
