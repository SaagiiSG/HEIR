import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-5 text-center">
      <p className="text-[11px] uppercase tracking-widest text-gray-400 mb-4">404</p>
      <h1 className="text-[28px] font-normal mb-3">Page Not Found</h1>
      <p className="text-[13px] text-gray-500 mb-10 max-w-sm">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="border border-black rounded-full px-6 py-2.5 text-[12px] tracking-wide hover:bg-black hover:text-white transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}
