import { Skeleton } from "@/components/ui/Skeleton";

export default function OrdersLoading() {
  return (
    <div className="p-8">
      <Skeleton className="h-6 w-24 mb-6" />
      {/* Status tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-100 pb-3">
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-4 w-20" />)}
      </div>
      <div className="border border-gray-100 rounded overflow-hidden">
        <div className="grid grid-cols-5 gap-4 px-4 py-3 bg-gray-50">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-3 w-full" />)}
        </div>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="grid grid-cols-5 gap-4 px-4 py-4 border-t border-gray-50">
            <Skeleton className="h-3 w-24 self-center" />
            <Skeleton className="h-3 w-28 self-center" />
            <Skeleton className="h-3 w-20 self-center" />
            <Skeleton className="h-5 w-20 rounded-full self-center" />
            <Skeleton className="h-3 w-16 self-center" />
          </div>
        ))}
      </div>
    </div>
  );
}
