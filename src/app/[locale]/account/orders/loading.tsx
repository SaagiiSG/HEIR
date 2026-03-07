export default function OrdersLoading() {
  return (
    <main className="px-5 py-12 max-w-[700px] mx-auto animate-pulse">
      <div className="h-6 w-36 bg-gray-200 rounded mb-8" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-20 bg-gray-200 rounded mb-3" />
      ))}
    </main>
  );
}
