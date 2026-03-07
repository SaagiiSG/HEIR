import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: { value: number; label: string };
  className?: string;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
}: StatsCardProps) {
  return (
    <div className={cn("border border-gray-100 p-5", className)}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-[11px] uppercase tracking-wide text-gray-500">{title}</p>
        {Icon && <Icon className="w-4 h-4 text-gray-300" strokeWidth={1.5} />}
      </div>
      <p className="text-[26px] font-normal leading-none mb-1">{value}</p>
      {subtitle && <p className="text-[11px] text-gray-400">{subtitle}</p>}
      {trend && (
        <p
          className={cn(
            "text-[11px] mt-2",
            trend.value >= 0 ? "text-green-600" : "text-red-500"
          )}
        >
          {trend.value >= 0 ? "+" : ""}
          {trend.value}% {trend.label}
        </p>
      )}
    </div>
  );
}
