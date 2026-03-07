export default function LoginLoading() {
  return (
    <main className="min-h-screen flex items-center justify-center px-5">
      <div className="w-full max-w-[360px] animate-pulse space-y-4">
        <div className="h-6 w-24 bg-gray-200 rounded mx-auto mb-8" />
        <div className="h-11 w-full bg-gray-200 rounded" />
        <div className="h-11 w-full bg-gray-200 rounded" />
        <div className="h-11 w-full bg-gray-200 rounded" />
        <div className="h-px w-full bg-gray-200 my-4" />
        <div className="h-11 w-full bg-gray-200 rounded" />
      </div>
    </main>
  );
}
