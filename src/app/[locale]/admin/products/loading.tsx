import { Skeleton } from "@/components/ui/Skeleton";

export default function ProductsLoading() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-9 w-28 rounded" />
      </div>
      <div className="border border-gray-100 rounded overflow-hidden">
        <div className="grid grid-cols-5 gap-4 px-4 py-3 bg-gray-50">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-3 w-full" />)}
        </div>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="grid grid-cols-5 gap-4 px-4 py-4 border-t border-gray-50">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-3 w-16 self-center" />
            <Skeleton className="h-3 w-20 self-center" />
            <Skeleton className="h-3 w-12 self-center" />
            <Skeleton className="h-3 w-14 self-center" />
          </div>
        ))}
      </div>
    </div>
  );
}
