export default function RegisterLoading() {
  return (
    <main className="min-h-screen flex items-center justify-center px-5">
      <div className="w-full max-w-[360px] animate-pulse space-y-4">
        <div className="h-6 w-24 bg-gray-200 rounded mx-auto mb-8" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-11 bg-gray-200 rounded" />
          <div className="h-11 bg-gray-200 rounded" />
        </div>
        <div className="h-11 w-full bg-gray-200 rounded" />
        <div className="h-11 w-full bg-gray-200 rounded" />
        <div className="h-11 w-full bg-gray-200 rounded" />
        <div className="h-11 w-full bg-gray-200 rounded" />
      </div>
    </main>
  );
}
