import { Skeleton } from "@/components/ui/Skeleton";

export default function AdminLoading() {
  return (
    <div className="p-8">
      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="border border-gray-100 p-5">
            <Skeleton className="h-3 w-20 mb-3" />
            <Skeleton className="h-7 w-28 mb-2" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
      {/* Chart + orders grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 border border-gray-100 p-5">
          <Skeleton className="h-4 w-32 mb-6" />
          <Skeleton className="h-48 w-full" />
        </div>
        <div className="border border-gray-100 p-5">
          <Skeleton className="h-4 w-28 mb-4" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex justify-between py-3 border-b border-gray-50">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
