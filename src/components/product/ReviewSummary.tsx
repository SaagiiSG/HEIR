import { StarRating } from "@/components/ui/StarRating";

interface ReviewSummaryProps {
  averageRating: number;
  totalCount: number;
  distribution: Record<number, number>; // { 5: 10, 4: 3, 3: 1, 2: 0, 1: 0 }
  locale: string;
}

export function ReviewSummary({ averageRating, totalCount, distribution, locale }: ReviewSummaryProps) {
  const isMn = locale === "mn";

  if (totalCount === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row gap-8 py-6 border-b border-gray-100">
      {/* Average */}
      <div className="flex flex-col items-start gap-1 min-w-[120px]">
        <span className="text-[40px] font-light leading-none">{averageRating.toFixed(1)}</span>
        <StarRating value={Math.round(averageRating)} size="sm" />
        <span className="text-[11px] text-gray-500">
          {isMn ? `${totalCount} сэтгэгдэл` : `${totalCount} reviews`}
        </span>
      </div>

      {/* Distribution bars */}
      <div className="flex flex-col gap-1.5 flex-1 justify-center">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = distribution[star] ?? 0;
          const pct = totalCount > 0 ? (count / totalCount) * 100 : 0;
          return (
            <div key={star} className="flex items-center gap-2">
              <span className="text-[11px] text-gray-500 w-3">{star}</span>
              <div className="flex-1 h-1.5 bg-gray-100">
                <div
                  className="h-full bg-black transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-[11px] text-gray-400 w-6 text-right">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
