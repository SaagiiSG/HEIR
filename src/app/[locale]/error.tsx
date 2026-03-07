"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-5 text-center">
      <p className="text-[11px] uppercase tracking-widest text-gray-400 mb-4">Error</p>
      <h1 className="text-[28px] font-normal mb-3">Something went wrong</h1>
      <p className="text-[13px] text-gray-500 mb-10 max-w-sm">
        An unexpected error occurred. Please try again or return to the store.
      </p>
      <div className="flex items-center gap-4">
        <button
          onClick={reset}
          className="border border-black rounded-full px-6 py-2.5 text-[12px] tracking-wide hover:bg-black hover:text-white transition-colors"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="text-[12px] text-gray-500 hover:text-black transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
