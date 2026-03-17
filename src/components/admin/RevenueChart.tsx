"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type DataPoint = { label: string; value: number };

interface RevenueChartProps {
  daily: DataPoint[];
  weekly: DataPoint[];
  monthly: DataPoint[];
  locale?: string;
}

type View = "daily" | "weekly" | "monthly";

function formatY(value: number): string {
  if (value >= 1_000_000) return `₮${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `₮${(value / 1_000).toFixed(0)}K`;
  return `₮${value}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 shadow-sm px-3 py-2 text-[12px]">
      <p className="text-gray-500 mb-0.5">{label}</p>
      <p className="font-medium">₮{(payload[0].value as number).toLocaleString()}</p>
    </div>
  );
}

export function RevenueChart({ daily, weekly, monthly, locale = "mn" }: RevenueChartProps) {
  const [view, setView] = useState<View>("weekly");
  const isMn = locale === "mn";

  const tabs: { key: View; label: string }[] = [
    { key: "daily",   label: isMn ? "Өдөр" : "Daily" },
    { key: "weekly",  label: isMn ? "7 хоног" : "Weekly" },
    { key: "monthly", label: isMn ? "Сар" : "Monthly" },
  ];

  const data = view === "daily" ? daily : view === "weekly" ? weekly : monthly;
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="border border-gray-100 bg-white p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">
            {isMn ? "Орлого" : "Revenue"}
          </p>
          <p className="text-[22px] font-medium tracking-tight">
            ₮{total.toLocaleString()}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border border-gray-200 rounded overflow-hidden text-[11px]">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setView(t.key)}
              className={`px-3 py-1.5 transition-colors ${
                view === t.key
                  ? "bg-black text-white"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#000" stopOpacity={0.12} />
              <stop offset="95%" stopColor="#000" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={formatY}
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#e5e7eb", strokeWidth: 1 }} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#000"
            strokeWidth={1.5}
            fill="url(#revenueGrad)"
            dot={false}
            activeDot={{ r: 4, fill: "#000", strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
