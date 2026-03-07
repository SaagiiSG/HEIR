import { Skeleton } from "@/components/ui/Skeleton";

export default function InventoryLoading() {
  return (
    <div className="p-8">
      <Skeleton className="h-6 w-28 mb-6" />
      <div className="border border-gray-100 rounded overflow-hidden">
        <div className="grid grid-cols-4 gap-4 px-4 py-3 bg-gray-50">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-3 w-full" />)}
        </div>
        {[...Array(10)].map((_, i) => (
          <div key={i} className="grid grid-cols-4 gap-4 px-4 py-4 border-t border-gray-50">
            <Skeleton className="h-3 w-32 self-center" />
            <Skeleton className="h-3 w-20 self-center" />
            <Skeleton className="h-3 w-12 self-center" />
            <div className="flex gap-2 self-center">
              <Skeleton className="h-7 w-7 rounded" />
              <Skeleton className="h-7 w-10 rounded" />
              <Skeleton className="h-7 w-7 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
