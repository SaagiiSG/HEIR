import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalCount: number;
  pageSize: number;
  searchParams: Record<string, string>;
  pathname: string;
}

export function Pagination({
  currentPage,
  totalCount,
  pageSize,
  searchParams,
  pathname,
}: PaginationProps) {
  const totalPages = Math.ceil(totalCount / pageSize);
  if (totalPages <= 1) return null;

  function pageHref(page: number) {
    const params = new URLSearchParams(searchParams);
    if (page === 0) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-3 mt-12">
      {currentPage > 0 && (
        <Link
          href={pageHref(currentPage - 1)}
          className="px-4 py-2 border border-gray-300 text-[12px] hover:border-black transition-colors"
        >
          ← Prev
        </Link>
      )}
      <span className="text-[12px] text-gray-500">
        {currentPage + 1} / {totalPages}
      </span>
      {currentPage < totalPages - 1 && (
        <Link
          href={pageHref(currentPage + 1)}
          className="px-4 py-2 border border-gray-300 text-[12px] hover:border-black transition-colors"
        >
          Next →
        </Link>
      )}
    </nav>
  );
}
