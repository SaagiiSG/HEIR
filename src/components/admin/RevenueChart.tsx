"use client";

interface DataPoint {
  label: string;
  value: number;
}

interface RevenueChartProps {
  data: DataPoint[];
  title?: string;
  locale?: string;
}

export function RevenueChart({ data, title, locale = "mn" }: RevenueChartProps) {
  if (data.length === 0) {
    return (
      <div className="border border-gray-100 p-6">
        {title && <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-4">{title}</p>}
        <p className="text-[13px] text-gray-400 text-center py-8">
          {locale === "mn" ? "Дата байхгүй" : "No data available"}
        </p>
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="border border-gray-100 p-6">
      {title && (
        <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-6">{title}</p>
      )}

      {/* Simple bar chart */}
      <div className="flex items-end gap-2 h-32">
        {data.map((point, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[10px] text-gray-400">
              ₮{(point.value / 1000).toFixed(0)}K
            </span>
            <div
              className="w-full bg-black transition-all duration-500"
              style={{ height: `${(point.value / max) * 100}%`, minHeight: "2px" }}
            />
          </div>
        ))}
      </div>

      {/* X labels */}
      <div className="flex gap-2 mt-2">
        {data.map((point, i) => (
          <div key={i} className="flex-1 text-center">
            <span className="text-[10px] text-gray-400">{point.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
